<template>
  <q-page class="flex-center justify-evenly">
    <q-card class="my-card">
      <q-card-section class="row justify-around">
        <q-radio v-model="mode" val="webauthn" label="Webauthn" />
        <q-radio v-model="mode" val="subtle" label="Subtle" />
        <q-radio v-model="mode" val="urlCallBack" label="UrlCallBack" />
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
  Address,
  AddressType,
  Amount,
  IndexerCollector
} from '@lay2/pw-core';
import { defineComponent, onMounted, ref } from '@vue/composition-api';
import UnipassProvider, { UnipassSign } from 'src/components/UnipassProvider';
import UnipassBuilder from 'src/components/UnipassBuilder';
import UnipassSigner from 'src/components/UnipassSigner';
import { createHash } from 'crypto';
import { Logout, getData } from 'src/components/LocalData';
import { nets, saveEnvData, getCkbEnv } from 'src/components/config';
import { getDataFromUrl, getPublick, getSignData } from 'src/components/utils';

export default defineComponent({
  name: 'PageIndex',
  beforeRouteEnter(to, from, next) {
    console.log('from', from.path);
    console.log('to', to.path);
    next();
  },
  setup() {
    const urls = nets;
    let provider = ref<UnipassProvider>();
    const mode = ref('urlCallBack');
    const message = ref('');
    const signature = ref('');
    const pubkey = ref('');
    const toAddress = ref('');
    const toAmount = ref(0);
    const txHash = ref('');
    const success = ref('');
    saveEnvData(urls[0].url);
    getDataFromUrl();
    const data = getData();
    if (data.sig) {
      pubkey.value = data.pubkey;
      signature.value = `0x01${data.sig.replace('0x', '')}`;
    }
    onMounted(async () => {
      const data = getData();
      if (data.address) {
        const url = getCkbEnv();
        await new PWCore(url.NODE_URL).init(
          new UnipassProvider(urls[0].url),
          new IndexerCollector(url.INDEXER_URL),
          url.CHAIN_ID
        );
        provider.value = PWCore.provider as UnipassProvider;
      }
    });
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
      success
    };
  },

  methods: {
    async login() {
      if (this.mode == 'urlCallBack') {
        const host = 'http://localhost:3000';
        const success_url = 'http://localhost:4000';
        const fail_url = 'http://localhost:4000';
        window.location.href = `${host}?success_url=${success_url}&fail_url=${fail_url}/#login`;
      } else {
        const url = getCkbEnv();
        await new PWCore(url.NODE_URL).init(
          new UnipassProvider(this.url),
          new IndexerCollector(url.INDEXER_URL),
          url.CHAIN_ID
        );
        this.provider = PWCore.provider as UnipassProvider;
      }
    },
    async recovery() {
      this.provider = await new UnipassProvider(this.url).recover();
      if (this.provider.recovery) {
        this.success = '重签恢复数据成功';
      } else {
        this.success = '重签恢复数据失败，请联系unipass团队';
      }
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
        const url = getCkbEnv();
        this.txHash = await new PWCore(url.NODE_URL).sendTransaction(
          builder,
          signer
        );
        console.log('this.txHash', this.txHash);
      } catch (err) {
        console.error(err);
      }
    },
    async sign() {
      console.log('[sign] message: ', this.mode);
      const messageHash = createHash('SHA256')
        .update(this.message || '0x')
        .digest('hex')
        .toString();
      if (this.mode == 'urlCallBack') {
        const host = 'http://localhost:3000';
        const success_url = 'http://localhost:4000';
        const fail_url = 'http://localhost:4000';
        const pubkey = getPublick();
        if (!pubkey) return;
        const _url = `${host}?success_url=${success_url}&fail_url=${fail_url}&pubkey=${pubkey}&message=${messageHash}/#sign`;
        console.log(_url);
        window.location.href = _url;
      } else {
        console.log('[sign] sig requested to ', this.url);
        const data = await new UnipassProvider(this.url).sign(messageHash);
        if (data.startsWith('0x')) {
          this.signature = data;
        } else {
          const info = JSON.parse(data) as UnipassSign;
          this.pubkey = info.pubkey;
          this.signature = `0x01${info.sign.replace('0x', '')}`;
        }
      }
    },
    goto(url: string) {
      window.location.href = url;
    },
    logout() {
      Logout();
      void window.location.reload();
    }
  },
  watch: {
    url(newVal: string) {
      console.log(newVal);
      saveEnvData(newVal);
    }
  },
  created() {
    // const query = this.$route.query
    // if (query.masterKey) {
    //   console.log('query', query)
    // }
  }
});
</script>
