import { Signer, Provider, Blake2bHasher, Message } from '@lay2/pw-core';

export class UnipassSigner extends Signer {
  providers: Provider[] = [];
  constructor(providers: Provider[] | Provider) {
    super(new Blake2bHasher());
    if (Array.isArray(providers)) {
      this.providers = providers;
    } else {
      this.providers = [providers];
    }
  }

  async signMessages(messages: Message[]) {
    const sigs = [];

    for (const message of messages) {
      let matched = false;
      for (const provider of this.providers) {
        console.log(
          'unipass-signer',
          provider.address.toLockScript().toHash() === message.lock.toHash()
        );
        if (
          provider.address.toLockScript().toHash() === message.lock.toHash()
        ) {
          console.log('unipass-signer', message.message);
          sigs.push(await provider.sign(message.message));

          matched = true;
          break;
        }
      }

      if (!matched) {
        sigs.push('0x');
      }
    }
    return sigs;
  }
}
