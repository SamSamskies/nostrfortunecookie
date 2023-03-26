import {
  nip05,
  nip19,
  getEventHash,
  signEvent,
  type Event,
  relayInit,
} from "nostr-tools";

export const DEFAULT_RELAYS = [
  "wss://relay.damus.io",
  "wss://relay.snort.social",
  "wss://nostr.wine",
  "wss://eden.nostr.land",
  "wss://relay.orangepill.dev",
  "wss://nostr.fmt.wiz.biz",
  "wss://nostr.milou.lol",
];

export const isNpub = (value: string) =>
  /npub1[acdefghjklmnpqrstuvwxyz023456789]{58}/.test(value);

export const getPubkeyAndRelays = async (value: string) => {
  try {
    if (isNpub(value)) {
      const pubkey = nip19.decode(value).data as string;
      const relays: { relay: string; read: boolean; write: boolean }[] =
        await fetch(`/api/users/${pubkey}/relays`).then((res) => res.json());
      const readRelays = relays
        ? relays.filter(({ read }) => read).map(({ relay }) => relay)
        : DEFAULT_RELAYS;

      return { pubkey, relays: readRelays };
    }

    const res = await nip05.queryProfile(value);

    if (!res?.pubkey) {
      throw new Error("No pubkey found for this nip-05");
    }

    return { pubkey: res.pubkey, relays: res?.relays ?? DEFAULT_RELAYS };
  } catch (error) {
    alert(error instanceof Error ? error.message : "something went wrong :(");
  }
};

interface FortuneCookieNoost {
  userPubkey: string; // hex
  fortuneCookiePubkey: string; // hex
  fortuneCookiePrivkey: string; // hex
  content: string;
}

export const createFortuneCookieNoost = ({
  userPubkey,
  fortuneCookiePubkey,
  fortuneCookiePrivkey,
  content,
}: FortuneCookieNoost) => {
  const baseEvent = {
    kind: 1,
    pubkey: fortuneCookiePubkey,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ["p", userPubkey],
      ["t", "fortunecookie"],
    ],
    content: `#[0] #FortuneCookie 🥠\n\n${content}`,
  };
  const eventWithId = { ...baseEvent, id: getEventHash(baseEvent) };

  return { ...eventWithId, sig: signEvent(eventWithId, fortuneCookiePrivkey) };
};

export const publishNoost = async (event: Event) => {
  const relay = relayInit("wss://nostr.mutinywallet.com");

  try {
    relay.on("connect", () => {
      console.log(`connected`);
    });
    relay.on("error", () => {
      console.log(`failed`);
    });

    await relay.connect();

    let pub = relay.publish(event);
    return await new Promise((resolve, reject) => {
      pub.on("ok", () => {
        console.log(`${relay.url} has accepted our event`);
        resolve(true);
      });
      pub.on("failed", (reason: string) => {
        console.log(`failed to publish to ${relay.url}: ${reason}`);
        reject();
      });
    });
  } catch (error) {
    return false;
  } finally {
    if (relay) {
      try {
        relay.close();
      } catch {
        // fail silently for errors that happen when closing the pool
      }
    }
  }
};

export const getExistingFortuneCookieEvent = async (pubkey: string) => {
  const fortuneCookieEventsUrl = `${window.location.origin}/api/users/${process.env.NEXT_PUBLIC_NOSTR_FORTUNE_COOKIE_PUBLIC_KEY}/events?limit=${process.env.NEXT_PUBLIC_EXISTING_FORTUNE_COOKIE_EVENTS_LIMIT}`;
  const fortuneCookieEvents: Event[] = await fetch(fortuneCookieEventsUrl).then(
    (res) => res.json()
  );
  return fortuneCookieEvents.find(({ tags }) => tags[0][1] === pubkey);
};
