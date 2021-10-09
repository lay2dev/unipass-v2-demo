<template>
  <q-page class="flex-center justify-evenly">
    <create-select
      :show.sync="showSelect"
      @select="bindSelect"
      class="fullscreen bg-white z-top"
    />
    <q-card class="my-card">
      <q-card-section class="row justify-around">
        <q-radio v-model="mode" val="url" label="URL-Subtle" />
        <q-radio v-model="mode" val="popup" label="Popup-Subtle" />
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
      <!-- home -->
      <q-card-section class="q-gutter-sm">
        <q-btn
          class="full-width"
          color="info"
          icon="home"
          label="Go Home"
          @click="goHome"
        />
      </q-card-section>

      <!-- info -->
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
          @click="bindLogin"
        />

        <q-btn
          class="full-width"
          color="info"
          icon="check"
          label="Logout"
          @click="bindLogout"
        />
      </q-card-section>
      <q-separator spaced />
      <!-- transfer -->
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
          @click="bindSend"
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

      <!-- transfer NFT -->
      <q-card-section>
        <div>
          <div class="full-width">
            <q-btn class="full-width" @click="openNFTList">选择NFT </q-btn>
          </div>
          <div>
            <div class="nft-list">
              <template v-for="(e, i) in nfts">
                <div v-if="e.checked.length" :key="i" class="nft">
                  <div class="nft-info">
                    <el-image
                      class="nft-image"
                      :src="e.renderer"
                      alt="bg_image_url"
                      fit="cover"
                      lazy
                    />
                    <div class="info">
                      <div class="name">{{ e.name }}</div>
                      <div class="user">
                        <div class="user-name">{{ e.issuerName }}</div>
                      </div>
                    </div>
                  </div>
                  <div class="nft-box">
                    <el-checkbox-group v-model="e.checked">
                      <template v-for="nft in e.children">
                        <el-checkbox
                          v-if="e.checked.includes(nft.tokenId)"
                          :key="nft.tokenId"
                          class="nft-one"
                          :label="nft.tokenId"
                          >#{{ nft.tokenId }}</el-checkbox
                        >
                      </template>
                    </el-checkbox-group>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator spaced />

      <!-- transfer ticket -->
      <q-card-section
        class="q-gutter-sm full-width row wrap justify-around items-center content-start"
      >
        <q-btn
          label="transfer nft"
          color="primary"
          no-caps
          class="col-3"
          @click="postTransferNFT"
        />
        <!-- check ticket -->
        <q-btn
          class="col-3"
          label="check ticket"
          color="primary"
          no-caps
          @click="checkTicke"
        />
        <!-- lock ticket -->
        <q-btn
          class="col-3"
          label="lock ticket"
          color="primary"
          no-caps
          @click="lockTicke"
        />
      </q-card-section>
      <q-separator spaced />

      <q-card-section class="q-gutter-sm"> </q-card-section>
      <q-separator spaced />

      <!-- sign -->
      <q-card-section class="q-gutter-sm">
        <div class="row">
          <q-input
            class="full-width"
            v-model="message"
            type="text"
            label="Message"
          />
          <q-toggle
            v-model="signVisualization"
            label="Sign Visualization"
          />
        </div>
        <q-btn
          class="full-width"
          color="info"
          icon="check"
          label="Sign"
          @click="bindSign"
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
  Message
} from '@lay2/pw-core';
import { defineComponent, ref } from '@vue/composition-api';
import UnipassProvider from 'src/components/UnipassProvider';
import UnipassBuilder from 'src/components/UnipassBuilder';
import UnipassSigner from 'src/components/UnipassSigner';
import { createHash } from 'crypto';
import { Logout, getData, saveAddress } from 'src/components/LocalData';
import { nets, saveEnvData, getCkbEnv } from 'src/components/config';
import { getDataFromUrl, getPublick,UnipassData } from 'src/components/utils';
import { LocalStorage } from 'quasar';
import createSelect from 'src/components/create-select.vue';
import {
  getNFTTransferSignMessage,
  SignTxMessage,
  getNFTransferSignCallback
} from 'src/compositions/transfer';
//
import {
  getTicketTransferSignMessage,
  getTicketTransferSignCallback
} from 'src/compositions/transfer-ticket';

export enum ActionType {
  Init,
  Login,
  SignMsg,
  SendTx,
  SendTrasnferTx,
  CheckTickeTx
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

function generateUnipassNewUrl(
  host: string,
  action: string,
  params: { [key: string]: string }
) {
  const urlObj = new URL(`${host}/${action.toLowerCase()}`);
  for (const key of Object.keys(params)) {
    urlObj.searchParams.set(key, params[key]);
  }
  console.log('urlObj.href', urlObj.href);
  return urlObj.href;
}

export default defineComponent({
  components: { createSelect },
  name: 'PageIndex',
  beforeRouteEnter(to, from, next) {
    console.log('from', from.path);
    console.log('to', to.path);
    next();
  },
  async created() {
    await this.init()
  },
  setup() {
    const urls = nets;
    let provider = ref<UnipassProvider>();

    const mode = ref('url');
    const message = ref('');
    const signature = ref('');
    const pubkey = ref('');
    const toAddress = ref('');
    const toAmount = ref(0);
    const txHash = ref('');
    const success = ref('');

    saveEnvData(urls[0].url);
    const nfts: any[] = [];
    const nftChecked: any[] = [];
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
      nfts,
      nftChecked,
      address: ref(''),
      showSelect: ref(false),
      signVisualization: true,
    };
  },

  methods: {
    async init(unipassData?: UnipassData) {
      try {
        const pageState = this.restoreState();
        let action = ActionType.Init;
        if (!!pageState) action = pageState.action;
        getDataFromUrl(unipassData);
        const data = getData();
        if (data.pubkey) {
          console.log('this.address', this.address);
          const url = getCkbEnv();

          PWCore.chainId = url.CHAIN_ID;
          await new PWCore(url.NODE_URL).init(
            new UnipassProvider(data.email, data.pubkey),
            new IndexerCollector(url.INDEXER_URL),
            url.CHAIN_ID
          );
          this.provider = PWCore.provider as UnipassProvider;
          this.address = PWCore.provider.address.addressString;
          saveAddress(PWCore.provider.address.addressString);
          console.log(
            'PWCore',
            PWCore.provider.address,
            PWCore.chainId,
            this.address,
            '------'
          );
        }
        switch (action) {
          case ActionType.Init:
            break;
          case ActionType.Login:
            this.pubkey = data.pubkey;

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
          //SendTrasnferTx
          case ActionType.SendTrasnferTx:
            if (data.sig) {
              const url = getCkbEnv();
              const extra = pageState?.extraObj as string;
              const txhash = await getNFTransferSignCallback(
                data.sig,
                extra,
                url.NODE_URL
              );
              this.txHash = txhash;
            }

            break;
          case ActionType.CheckTickeTx:
            if (data.sig) {
              const url = getCkbEnv();
              const extra = pageState?.extraObj as string;
              const txhash = await getTicketTransferSignCallback(
                data.sig,
                extra,
                url.NODE_URL
              );
              this.txHash = txhash;
            }

            break;
        }
      } catch (err) {
        console.log(err)
        return
      }

    },
    bindSelect(nfts: any[], checked: any[]) {
      this.nfts = nfts;
      this.nftChecked = checked;
    },
    goHome() {
      window.location.href = this.url;
    },
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
          url: this.url
        } as PageData
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
    bindLogin() {
      if (this.mode ==='url') {
        this.login()
      } else {
        this.loginPopup()
      }
    },
    login() {
      const host = this.url;
      const success_url = window.location.origin;
      window.location.href = generateUnipassNewUrl(host, 'login', {
        success_url
      });
      this.saveState(ActionType.Login);

    },
    loginPopup() {
      window.open(
        // 'http://localhost:5000/login?success_url=open',
        generateUnipassNewUrl( this.url,'login',{success_url: 'open'}),
        '',
        'width=380,height=675,top=40,left=100,toolbar=no,scrollbars=yes,location=no,status=no',
      )
      window.addEventListener('message', (event) => {
        // eslint-disable-next-line
        if (event.data && event.data.code === 200) {
          // eslint-disable-next-line
          this.init(event.data)
        }
      }, false);
    },
    recovery() {
      this.success = '重签功能失效';
    },
    async bindSend() {
      try {
        if (!this.provider) {
          console.log('需要登录')
          return
        }
        console.log(
          'this.provider.address',
          this.provider.address.toCKBAddress()
        );
        const builder = new UnipassBuilder(
          // this.provider.address,
          new Address(this.toAddress, AddressType.ckb),
          new Amount(`${this.toAmount}`)
        );
        console.log(builder);
        const signer = new UnipassSigner(this.provider);

        const tx = await builder.build();
        console.log('tx', tx);
        const messages = signer.toMessages(tx);
        console.log('messages', messages);
        const pubkey = this.pubkey;
        const txObj = transformers.TransformTransaction(tx);
        this.saveState(ActionType.SendTx, JSON.stringify({ txObj, messages }));
        this.sign(messages[0].message, pubkey)
      } catch (err) {
        console.error(err);
      }
    },
    openNFTList() {
      const localData = getData();
      this.address = localData.address;
      this.showSelect = true;
    },
    async postTransferNFT() {
      console.log('postTransferNFT');
      if (!this.toAddress) return;
      if (this.nftChecked.length === 0) {
        this.showSelect = true;
        return;
      }
      const data = await getNFTTransferSignMessage(
        this.toAddress,
        this.nftChecked
      );
      if (!data) return;
      const localData = getData();
      const pubkey = localData.pubkey;
      this.saveState(ActionType.SendTrasnferTx, (data as SignTxMessage).data);
      this.sign((data as SignTxMessage).messages, pubkey)
    },
    async sendTxCallback(sig: string, extraObj: string | undefined) {
      if (!extraObj) return;
      try {
        console.log('sendTxCallback sig', sig);
        console.log('sendTxCallback extraObj', extraObj);
        const witnessArgs: WitnessArgs = {
          lock: '0x01' + sig.replace('0x', ''),
          input_type: '',
          output_type: ''
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
    bindSign() {
      console.log('[sign] message: ', this.mode);
      let message = encodeURIComponent(this.message)
      if (!this.signVisualization) {
        message = createHash('SHA256')
          .update(message || '0x')
          .digest('hex')
          .toString();
      }
      this.saveState(ActionType.SignMsg);
      const pubkey = getPublick();
      this.sign(message, pubkey)
    },
    sign(messageHash: string, pubkey_: string) {
      const pubkey = pubkey_ || getPublick()
      if (!pubkey) {
        console.log('pubkey 不存在')
        return
      };
      const success_url = window.location.origin;
      const host = this.url;
      if (this.mode === 'url') {
        const url = generateUnipassNewUrl(host, 'sign', {
          success_url,
          pubkey,
          message: messageHash
        });
        window.location.href = url;
      } else {
        const url = generateUnipassNewUrl(host,'sign',{
          success_url: 'open',
          pubkey,
          message: messageHash
        })
        window.open(
          url,
          '',
          'width=380,height=675,top=40,left=100,toolbar=no,scrollbars=yes,location=no,status=no',
        )
        window.addEventListener('message', (event) => {
          // eslint-disable-next-line
          if (event.data && event.data.code === 200) {
            // eslint-disable-next-line
            this.init(event.data)
          }
        }, false);
      }
    },
    goto(url: string) {
      window.location.href = url;
    },

    async checkTicke() {
      console.log('checkTicke');
      const account = getData();
      if (!account.address) return;
      this.address = account.address;
      if (this.nftChecked.length === 0) {
        this.showSelect = true;
        return;
      }
      const data = await getTicketTransferSignMessage(
        account.address,
        this.nftChecked
      );
      if (!data) return;
      const pubkey = account.pubkey;
      this.saveState(ActionType.CheckTickeTx, (data as SignTxMessage).data);
      this.sign((data as SignTxMessage).messages, pubkey)
    },
    async lockTicke() {
      const account = getData();
      if (!account.address) return;
      this.address = account.address;
      if (this.nftChecked.length === 0) {
        this.showSelect = true;
        return;
      }
      const data = await getTicketTransferSignMessage(
        account.address,
        this.nftChecked,
        '02'
      );
      if (!data) return;
      const pubkey = account.pubkey;
      this.saveState(ActionType.CheckTickeTx, (data as SignTxMessage).data);
      this.sign((data as SignTxMessage).messages, pubkey)
    },

    bindLogout() {
      Logout();
      void window.location.reload();
    }
  },
  watch: {
    url(newVal: string) {
      console.log(newVal);
      saveEnvData(newVal);
    }
  }
});
</script>

<style lang="stylus">
.nft-list {
  width: 100%;
  border: 0;
  .nft {
    .nft-info {
      display: flex;
      align-items: center;
      width: 100%;
      padding: 16px 0;
      cursor: pointer;
      margin-right: 6px;

      .nft-image {
        background: #eee;
        height: 50px;
        width: 50px;
        flex-shrink: 0;
        box-shadow: 0px 1px 3px 1px rgba(0, 0, 0, 0.24);
        border-radius: 4px;
        overflow: hidden;
      }

      .info {
        margin-top: 4px;
        margin-left: 10px;

        .name {
          color: rgba(16, 16, 16, 100);
          font-size: 16px;
          line-height: 16px;
          font-weight: bold;
        }

        .user {
          margin-top: 5px;
          display: flex;
          align-items: center;

          .user-name {
            font-size: 14px;
            color: #aaa;
          }
        }
      }
    }

    .nft-box {
      display: flex;
      flex-wrap: wrap;
      border-bottom: 1px solid #f4f4f4;

      .nft-one {
        margin-bottom: 14px;
        border-radius: 5px;
        background: #e6e6e6;
        margin-right: 24px;
        width: 50px;
        height: 26px;
        line-height: 26px;
        text-align: center;

        .el-checkbox__input {
          display: none;
        }

        .el-checkbox__label {
          padding-left: 0;
        }
      }

      .nft-one.is-checked {
        background: #f35543;

        .el-checkbox__input.is-checked + .el-checkbox__label {
          color: #fff;
        }
      }
    }
  }
}
</style>
