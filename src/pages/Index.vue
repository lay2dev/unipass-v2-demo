<template>
  <q-page class="flex-center justify-evenly">
    <q-card class="my-card">
      <q-card-section class="row justify-around">
        <q-radio v-model="mode" val="webauthn" label="Webauthn" />
        <q-radio v-model="mode" val="subtle" label="Subtle" />
        <div>
          <q-field> {{ url }}</q-field>
          <q-select
            behavior="menu"
            filled
            use-input
            use-chips
            input-class="text-bold"
            new-value-mode="add-unique"
            v-model="url"
            :options="urls"
            option-value="url"
            option-label="name"
            emit-value
            map-options
          />
        </div>
      </q-card-section>
    </q-card>
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

        <q-btn
          class="full-width"
          color="info"
          icon="check"
          label="Logout"
          @click="logout"
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
        <div class="row" style="word-break: break-all;">
          <b>pubkey:</b> {{ pubkey }}
          <br />
          <b>SIGNATURE:</b> {{ signature }}
        </div>
      </q-card-section>
      <q-card-section>
        <q-btn
          class="full-width"
          color="primary"
          type="submit"
          icon="login"
          no-caps
          label="Re-sign Recovery Data"
          @click="recovery"
        />
        <div class="row q-my-sm">
          {{ success }}
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
  RPC,
  Reader,
  Address,
  AddressType,
  Amount,
  IndexerCollector,
  normalizers,
  SerializeWitnessArgs,
  WitnessArgs,
  transformers,
  Message,
} from '@lay2/pw-core';
import { defineComponent, ref } from '@vue/composition-api';
import UnipassProvider from 'src/components/UnipassProvider';
import UnipassBuilder from 'src/components/UnipassBuilder';
import UnipassSigner from 'src/components/UnipassSigner';
import { createHash } from 'crypto';
import { Logout, getData } from 'src/components/LocalData';
import { nets, saveEnvData, getCkbEnv } from 'src/components/config';
import { getDataFromUrl, getPublick } from 'src/components/utils';
import { LocalStorage } from 'quasar';

export enum ActionType {
  Init,
  Login,
  SignMsg,
  SendTx,
}

export interface PageState {
  action: ActionType;
  data: PageData;
  extraObj: string;
}
export interface PageData {
  mode: string;
  message: string;
  signature: string;
  pubkey: string;
  toAddress: string;
  toAmount: number;
  txHash: string;
  success: string;
  url: string;
}
export interface SendTxState {
  txObj: any;
  messages: Message[];
}

export default defineComponent({
  name: 'PageIndex',
  beforeRouteEnter(to, from, next) {
    console.log('from', from.path);
    console.log('to', to.path);
    next();
  },
  async created() {
    try {
      const pageState = this.restoreState();
      let action = ActionType.Init;
      if (!!pageState) action = pageState.action;

      getDataFromUrl();
      const data = getData();
      if (data.address) {
        const url = getCkbEnv();
        await new PWCore(url.NODE_URL).init(
          new UnipassProvider(data.email, data.address),
          new IndexerCollector(url.INDEXER_URL),
          url.CHAIN_ID
        );
        this.provider = PWCore.provider as UnipassProvider;
      }

      switch (action) {
        case ActionType.Init:
          break;
        case ActionType.Login:
          break;
        case ActionType.SignMsg:
          if (data.sig) {
            this.pubkey = data.pubkey;
            this.signature = `0x01${data.sig.replace('0x', '')}`;
          }
          break;
        case ActionType.SendTx:
          if (data.sig)
            await this.sendTxCallback(data.sig, pageState?.extraObj);
          break;
      }
    } catch (e) {
      return;
    }
  },
  setup() {
    const urls = nets;
    let provider = ref<UnipassProvider>();

    const mode = ref('subtle');
    const message = ref('');
    const signature = ref('');
    const pubkey = ref('');
    const toAddress = ref('');
    const toAmount = ref(0);
    const txHash = ref('');
    const success = ref('');

    saveEnvData(urls[0].url);
    return {
      mode,
      url: urls[0].url,
      provider,
      toAddress,
      toAmount,
      txHash,
      message,
      signature,
      pubkey,
      urls,
      success,
    };
  },

  methods: {
    saveState(action: ActionType, extraObj = '') {
      const pageState: PageState = {
        action,
        extraObj,
        data: {
          mode: this.mode,
          message: this.message,
          signature: this.signature,
          pubkey: this.pubkey,
          toAddress: this.toAddress,
          toAmount: this.toAmount,
          txHash: this.txHash,
          success: this.success,
          url: this.url,
        } as PageData,
      };
      LocalStorage.set('page_state', pageState);
    },
    restoreState(): PageState | undefined {
      const pageState = LocalStorage.getItem('page_state') as PageState;
      if (!pageState) return undefined;

      const pageData = pageState.data;

      this.mode = pageData.mode;
      this.message = pageData.message;
      this.signature = pageData.signature;
      this.pubkey = pageData.pubkey;
      this.toAddress = pageData.toAddress;
      this.toAmount = pageData.toAmount;
      this.txHash = pageData.txHash;
      this.url = pageData.url;

      saveEnvData(this.url);
      LocalStorage.remove('page_state');

      return pageState;
    },
    login() {
      const host = this.url;
      const success_url = window.location.origin;
      const fail_url = window.location.origin;
      window.location.href = `${host}?success_url=${success_url}&fail_url=${fail_url}/#login`;
      this.saveState(ActionType.Login);
    },
    recovery() {
      this.success = '重签功能失效';
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

        const tx = await builder.build();
        const messages = signer.toMessages(tx);

        const host = this.url;
        const success_url = window.location.origin;
        const fail_url = window.location.origin;
        const pubkey = this.pubkey;
        if (!pubkey) return;
        const _url = `${host}?success_url=${success_url}&fail_url=${fail_url}&pubkey=${pubkey}&message=${messages[0].message}/#sign`;

        const txObj = transformers.TransformTransaction(tx);
        this.saveState(ActionType.SendTx, JSON.stringify({ txObj, messages }));
        console.log(_url);
        window.location.href = _url;
      } catch (err) {
        console.error(err);
      }
    },
    async sendTxCallback(sig: string, extraObj: string | undefined) {
      if (!extraObj) return;
      try {
        console.log('sendTxCallback sig', sig);
        console.log('sendTxCallback extraObj', extraObj);
        const witnessArgs: WitnessArgs = {
          lock: '0x01' + sig.replace('0x', ''),
          input_type: '',
          output_type: '',
        };

        const witness = new Reader(
          SerializeWitnessArgs(normalizers.NormalizeWitnessArgs(witnessArgs))
        ).serializeJson();

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const { txObj, messages } = JSON.parse(extraObj) as SendTxState;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        txObj.witnesses[0] = witness;

        console.log('txObj', txObj);

        const url = getCkbEnv();
        console.log('url', url);
        const rpc = new RPC(url.NODE_URL);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.txHash = await rpc.send_transaction(txObj);
        console.log('this.txHash', this.txHash);
      } catch (err) {
        console.error('send tx error', err);
      }
    },
    sign() {
      console.log('[sign] message: ', this.mode);
      const messageHash = createHash('SHA256')
        .update(this.message || '0x')
        .digest('hex')
        .toString();
      const host = this.url;
      const success_url = window.location.origin;
      const fail_url = window.location.origin;
      const pubkey = getPublick();
      if (!this.provider || !pubkey) return;
      const _url = `${host}?success_url=${success_url}&fail_url=${fail_url}&pubkey=${pubkey}&message=${messageHash}/#sign`;
      this.saveState(ActionType.SignMsg);
      console.log(_url);
      window.location.href = _url;
    },
    goto(url: string) {
      window.location.href = url;
    },
    logout() {
      Logout();
      void window.location.reload();
    },
  },
  watch: {
    url(newVal: string) {
      console.log(newVal);
      saveEnvData(newVal);
    },
  },
});
</script>
