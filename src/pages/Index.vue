<template>
  <q-page class="flex-center justify-evenly">
    <q-card class="my-card">
      <q-card-section class="row justify-around">
        <q-radio v-model="mode" val="webauthn" label="Webauthn" />
        <q-radio v-model="mode" val="subtle" label="Subtle" />
      </q-card-section>
    </q-card>
    <q-select
      dense
      transition-show="jump-up"
      transition-hide="jump-up"
      square
      input-class="text-bold"
      v-model="url"
      :display-value="url"
      :options="urls"
    />
    <q-card class="my-card">
      <q-card-section class="q-gutter-sm">
        <div class="row"><b>EMAIL:</b> {{ provider && provider.email }}</div>
        <div class="row" style="word-break: break-all;">
          <b>ADDRESS:</b> {{ provider && provider.address }}
        </div>
        <q-btn
          class="full-width"
          color="primary"
          type="submit"
          icon="login"
          label="Login"
          @click="login"
        />
      </q-card-section>
      <q-separator spaced />
      <q-card-section class="q-gutter-sm">
        <div class="row">
          <q-input
            class="full-width"
            v-model="toAddress"
            type="text"
            label="TO:"
          />
        </div>
        <div class="row">
          <q-input
            class="full-width"
            v-model="toAmount"
            type="number"
            suffix=" CKB"
          />
        </div>
        <q-btn
          class="full-width"
          color="info"
          icon="send"
          label="Send"
          @click="send"
        />
        <div class="row" style="word-break: break-all;">
          <b>TX:</b>
          <a
            :href="`https://explorer.nervos.org/aggron/transaction/${txHash}`"
            >{{ txHash }}</a
          >
        </div>
      </q-card-section>
      <q-separator spaced />
      <q-card-section class="q-gutter-sm">
        <div class="row">
          <q-input
            class="full-width"
            v-model="message"
            type="text"
            label="Message"
          />
        </div>
        <q-btn
          class="full-width"
          color="info"
          icon="check"
          label="Sign"
          @click="sign"
        />
        <q-btn
          class="full-width"
          color="info"
          icon="check"
          label="Logout"
          @click="logout"
        />
        <div class="row" style="word-break: break-all;">
          <b>SIGNATURE:</b> {{ signature }}
        </div>
      </q-card-section>
    </q-card>
    <q-footer class="text-center" @click="goto('https://lay2.tech')">
      <span class="text-caption"> Lay2 Tech, 2021</span>
    </q-footer>
  </q-page>
</template>

<script lang="ts">
import PWCore, {
  Address,
  AddressType,
  Amount,
  IndexerCollector,
} from '@lay2/pw-core';
import { defineComponent, ref } from '@vue/composition-api';
import UnipassProvider from 'src/components/UnipassProvider';
import UnipassBuilder from 'src/components/UnipassBuilder';
import UnipassSigner from 'src/components/UnipassSigner';
import { createHash } from 'crypto';
import { Logout } from 'src/components/LocalData';

const NODE_URL = 'https://testnet.ckb.dev';
const INDEXER_URL = 'https://testnet.ckb.dev/indexer';
const UNIPASS_URL = 'https://unipass.me/';
const UNIPASS_URL_LOCAL = 'http://localhost:8080';

export default defineComponent({
  name: 'PageIndex',
  setup() {
    const urls = [UNIPASS_URL, UNIPASS_URL_LOCAL];
    let provider = ref<UnipassProvider>();
    const mode = ref('subtle');
    const message = ref('');
    const signature = ref('');
    const toAddress = ref('');
    const toAmount = ref(0);
    const txHash = ref('');

    return {
      mode,
      url: ref(UNIPASS_URL),
      provider,
      toAddress,
      toAmount,
      txHash,
      message,
      signature,
      urls,
    };
  },
  methods: {
    async login() {
      await new PWCore(NODE_URL).init(
        new UnipassProvider(this.url),
        new IndexerCollector(INDEXER_URL)
      );
      this.provider = PWCore.provider as UnipassProvider;
    },
    async send() {
      try {
        if (!this.provider) throw new Error('Need Login');
        console.log(
          'this.provider.address',
          this.provider.address.toCKBAddress()
        );
        const builder = new UnipassBuilder(
          // this.provider.address,
          new Address(this.toAddress, AddressType.ckb),
          new Amount(`${this.toAmount}`)
        );
        const signer = new UnipassSigner(this.provider);
        this.txHash = await new PWCore(NODE_URL).sendTransaction(
          builder,
          signer
        );
        console.log('this.txHash', this.txHash);
      } catch (err) {
        console.error(err);
      }
    },
    async sign() {
      // if (!this.provider) throw new Error('Need Login');
      console.log('[sign] message: ', this.message);
      // preprocess message before sign
      const messageHash = createHash('SHA256')
        .update(this.message)
        .digest('hex')
        .toString();

      console.log('[sign] sig requested to ', this.url);
      this.signature = await new UnipassProvider(this.url).sign(messageHash);
    },
    goto(url: string) {
      window.location.href = url;
    },
    logout() {
      Logout();
      void window.location.reload();
    },
  },
});
</script>
