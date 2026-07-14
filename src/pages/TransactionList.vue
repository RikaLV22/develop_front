<template>

  <div class="page">

    <div class="blob-background">

      <div class="blob blob1"></div>
      <div class="blob blob2"></div>
      <div class="blob blob3"></div>

    </div>

    <div class="top-menu">
      <div class="dropdown">

        <button
          class="btn btn-dark dropdown-toggle"
          data-bs-toggle="dropdown"
        >
          メニュー
        </button>

        <ul class="dropdown-menu dropdown-menu-end">

          <li>
            <button class="dropdown-item" @click="goProfile">
              プロフィールへ
            </button>
          </li>

          <li>
            <hr class="dropdown-divider">
          </li>

          <li>
            <button class="dropdown-item text-danger" @click="logout">
              ログアウト
            </button>
          </li>

        </ul>

      </div>
    </div>


    <div class="dashboard-container">

      <div class="top-row">

        <div class="calendar-wrapper">

          <div class="summary">
            <div class="summary-item income">収入: {{ totalIncome }}円</div>
            <div class="summary-item expense">支出: {{ totalExpense }}円</div>
            <div class="summary-item balance">残金: {{ balance }}円</div>
          </div>

          <div class="calendar-header">
            <h3>の家計簿</h3>
          </div>

          <FullCalendar
            defaultView="dayGridMonth"
            :plugins="calendarPlugins"
            :events="calendarEvents"
            locale="ja"
            :header-toolbar="calendarHeader"
            @dateClick="openModalForDate"
            @eventClick="openModalForEvent"
          />

        </div>


        <div class="chart-wrapper">

          <h4 class="chart-title">収入と支出内訳</h4>

          <apexchart
            type="pie"
            :options="dynamicChartOptions"
            :series="chartSeries"
            height="280"
            width="100%"
          />

        </div>

        <div class="my-panel">
          <h5>あなたの収支</h5>
          <p>総収入: {{ myIncome }}円</p>
          <p>総支出: {{ myExpense }}円</p>
          <p>残金: {{ myBalance }}円</p>
        </div>

      </div>


      <div class="bottom-row">

        <div class="chart-wrapper">

          <h4 class="chart-title">ユーザー別支出割合</h4>

          <apexchart
            type="bar"
            :options="userPercentOptions"
            :series="userPercentSeries"
            height="150"
            width="100%"
          />

        </div>

      </div>

      <div class="modal fade" ref="transactionModal" tabindex="-1">

        <div class="modal-dialog">

          <div class="modal-content">

            <div class="modal-header">

              <h5 class="modal-title">
                {{ editingId ? '家計簿を編集' : '家計簿をつける' }}
              </h5>

              <button class="btn-close" data-bs-dismiss="modal"></button>

            </div>


            <div class="modal-body">

              <form>

                <div class="mb-3">

                  <label>収支種別</label>

                  <select class="form-select" v-model="newTransaction.transaction_type">

                    <option value="">選択してください</option>
                    <option value="income">収入</option>
                    <option value="expense">支出</option>

                  </select>

                </div>


                <div class="mb-3">

                  <label>カテゴリー</label>

                  <input
                    v-if="newTransaction.transaction_type==='income'"
                    class="form-control"
                    value="収入"
                    readonly
                  />

                  <select
                    v-if="newTransaction.transaction_type==='expense'"
                    class="form-select"
                    v-model="newTransaction.category"
                  >

                    <option value="">選択してください</option>
                    <option>食費</option>
                    <option>交通費</option>
                    <option>趣味</option>
                    <option>水道光熱費</option>
                    <option>家賃</option>
                    <option>衣類費</option>
                    <option>医療費</option>
                    <option>交際費</option>
                    <option>日用品費</option>
                    <option>通信費</option>
                    <option>その他</option>

                  </select>

                </div>


                <div class="mb-3">

                  <label>金額</label>

                  <input
                    type="number"
                    class="form-control"
                    v-model="newTransaction.amount"
                  />

                </div>


                <div class="mb-3">

                  <label>日付</label>

                  <input
                    type="date"
                    class="form-control"
                    v-model="newTransaction.date"
                  />

                </div>


                <div class="mb-3">

                  <label>支払方法</label>

                  <input
                    v-if="newTransaction.transaction_type==='income'"
                    class="form-control"
                    value="-"
                    readonly
                  />

                  <select
                    v-if="newTransaction.transaction_type==='expense'"
                    class="form-select"
                    v-model="newTransaction.payment_method"
                  >

                    <option value="">選択してください</option>
                    <option>現金</option>
                    <option>クレジット</option>
                    <option>引き落とし</option>

                  </select>

                </div>

                <div
                  class="mb-3"
                  v-if="newTransaction.transaction_type === 'income' ||
                        (newTransaction.transaction_type === 'expense' && newTransaction.payment_method === '引き落とし')"
                >

                <label>口座</label>

                <select v-model="selectedAccountId" class="form-select">
                  <option value="">選択してください</option>
                  <option
                    v-for="account in accounts"
                    :key="account.id"
                    :value="account.id"
                  >
                    {{ account.bank.name }} - {{ account.account_number }}
                      (残高: {{ account.balance }}円)
                  </option>
                </select>

                <button
                  class="btn btn-sm btn-outline-primary mt-2"
                  @click.prevent="openAccountModal">
                  口座を追加
                </button>

                </div>

              </form>

            </div>


            <div class="modal-footer">

              <button
                v-if="editingId"
                class="btn btn-danger me-auto"
                @click="deleteTransaction"
              >
                削除
              </button>

              <button class="btn btn-secondary" data-bs-dismiss="modal">
                閉じる
              </button>

              <button class="btn btn-primary" @click="createTransaction">
                {{ editingId ? '編集' : '追加' }}
              </button>

            </div>

          </div>

        </div>

      </div>

      <div class="modal fade" ref="accountModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">

            <div class="modal-header">
              <h5 class="modal-title">口座登録</h5>
              <button class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">

              <div class="mb-3">
                <label>銀行名</label>
                <select v-model="newAccount.bank_id" class="form-select">
                  <option value="">選択してください</option>
                  <option v-for="bank in banks" :key="bank.id" :value="bank.id">
                    {{ bank.name }}
                  </option>
                </select>
              </div>

              <div class="mb-3">
                <label>口座番号</label>
                <input v-model="newAccount.account_number" class="form-control" />
              </div>

              <div class="mb-3">
                <label>初期残高</label>
                <input type="number" v-model="newAccount.balance" class="form-control" />
              </div>

            </div>

            <div class="modal-footer">
              <button class="btn btn-secondary" data-bs-dismiss="modal">閉じる</button>
              <button class="btn btn-primary" @click="createAccount">登録</button>
            </div>

          </div>
        </div>
      </div>


    </div>

    <button
      class="chat-button"
      @click="chatOpen = !chatOpen"
    >
      💬
    </button>

    <div
      class="chat-window"
      v-if="chatOpen"
    >

      <div class="chat-header">
        AI家計簿BOT

        <button @click="chatOpen=false">
          ✕
        </button>

      </div>

      <div class="chat-body">

        <div
          v-for="(message,index) in messages"
          :key="index"
          :class="message.role"
        >
          {{ message.text }}
        </div>

      </div>

      <div class="chat-footer">

        <input
          v-model="chatInput"
          @keyup.enter="sendMessage"
        >

        <button @click="sendMessage">
          送信
        </button>

      </div>

    </div>

  </div>

</template>

<script>
import api from '@/plugins/axios'
import FullCalendar from '@fullcalendar/vue'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import '@fullcalendar/core/main.css'
import '@fullcalendar/daygrid/main.css'
import VueApexCharts from 'vue-apexcharts'
import * as bootstrap from 'bootstrap'

export default {
  name: 'TransactionList',
  components: { FullCalendar, apexchart: VueApexCharts },

  data() {
    return {
      transactions: [],
      calendarEvents: [],
      currentUser: null,
      editingId: null,
      accounts: [],
      banks: [],
      selectedAccountId: null,
      newAccount: {
        bank_id: "",
        account_number: '',
        balance: 0
      },
      calendarPlugins: [dayGridPlugin, interactionPlugin],

      calendarHeader: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,dayGridWeek,dayGridDay'
      },

      newTransaction: {
        transaction_type: '',
        category: '',
        amount: 0,
        date: '',
        payment_method: ''
      },

      chartSeries: [],
      chartLabels: [],

      baseChartOptions: {
        colors: [
          '#3b82f6','#ef4444','#f97316','#facc15','#8b5cf6',
          '#ec4899','#14b8a6','#f43f5e','#60a5fa','#a3e635','#f87171'
        ],
        legend: {
          position: 'bottom',
          offsetY: 10,
          labels: { colors: '#ffffff' },
          fontSize: '16px',
          fontWeight: 600
        },
        chart: { height: '100%' }
      },

      userPercentSeries: [],

      userPercentOptions: {
        chart: {
          type: "bar",
          stacked: true,
          stackType: "100%",
          toolbar: {
            show: false
          }
        },
        tooltip: {
          theme: "light",
          style: {
            fontSize: "14px"
          }
        },
        plotOptions: {
          bar: {
            horizontal: true,
            barHeight: "30%",
            borderRadius: 10
          },
        grid: {
          show: false
        }
        },
        xaxis: {
          categories: ["支出割合"],
          labels: {
            show: false
          },
          axisTicks: {
            show: false
          },
          style: {
            colors: '#ffffff'
          }
        },
        yaxis: {
          labels: {
            style: {
              fontSize: "18px",
              colors: '#ffffff'
            }
          },
          axisBorder: {
            show: false
          },
          axisTicks: {
            show: false
          }
        },
        dataLabels: {
          enabled: true,
          style: {
            fontSize: "20px",
            colors: ["#fff"]
          },
          formatter: function(val,opts) {
            const name = opts.w.config.series[opts.seriesIndex].name
            return name + " " + val.toFixed(1) + "%"
          }
        },
        legend: {
          show: false
        }
      },

      chatOpen: false,

      messages: [
        {
          role:"bot",
          text:"こんにちは！家計簿BOTです！"
        }
      ],

      chatInput:""
    }

  },

  computed: {
    dynamicChartOptions() {
      return { ...this.baseChartOptions, labels: this.chartLabels }
    },

    totalIncome() {
      return this.transactions
        .filter(t => t.transaction_type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0)
    },

    totalExpense() {
      return this.transactions
        .filter(t => t.transaction_type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0)
    },

    balance() {
      return this.totalIncome - this.totalExpense
    },

    myTransactions() {
      if (!this.currentUser || !this.transactions) return []
      return this.transactions.filter(
        t => Number(t.user_id) === Number(this.currentUser.id)
      )
    },
    myIncome() {
      return this.myTransactions
        .filter(t => t.transaction_type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0)
    },
    myExpense() {
      return this.myTransactions
        .filter(t => t.transaction_type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0)
    },
    myBalance() {
      return this.myIncome - this.myExpense
    }
  },

  methods: {

    async fetchTransactions() {
    
      const res = await api.get('/transactions')
      this.transactions = res.data

      this.calendarEvents = res.data.map(t => ({
        id: t.id,
        title: `${t.transaction_type==='income'?'+':'-'}${t.amount}円`,
        date: t.date,
        color: t.transaction_type==='income' ? 'blue' : 'red'
      }))

      const income = this.transactions
        .filter(t => t.transaction_type==='income')
        .reduce((sum,t)=>sum+Number(t.amount),0)

      const expenses = this.transactions.filter(t => t.transaction_type==='expense')

      const categoryMap = {}
      expenses.forEach(e=>{
        if(!e.category) return
        categoryMap[e.category] =
          (categoryMap[e.category] || 0) + Number(e.amount)
      })

      this.chartSeries = [income, ...Object.values(categoryMap)]
      this.chartLabels = ['収入', ...Object.keys(categoryMap)]

      const userMap = {}
      this.transactions.forEach(t => {
        if (t.transaction_type !== "expense") return
        const name = t.user_name || "不明"
        if (!userMap[name]) userMap[name] = 0
        userMap[name] += Number(t.amount)
      })

      const total = Object.values(userMap).reduce((a,b)=>a+b,0)

      this.userPercentSeries =
        Object.keys(userMap).map(name => ({
          name: name,
          data: [userMap[name] / total * 100]
        }))
    },

    openModalForDate(info) {
      this.resetForm()
      this.newTransaction.date = info.dateStr
      new bootstrap.Modal(this.$refs.transactionModal).show()
    },

    openModalForEvent(info) {
      const t = this.transactions.find(x=>x.id==info.event.id)
      if(!t) return
      this.editingId = t.id
      this.newTransaction = {...t}
      new bootstrap.Modal(this.$refs.transactionModal).show()
    },

    openAccountModal() {
      new bootstrap.Modal(this.$refs.accountModal).show()
    },

    async fetchBanks() {
      const res = await api.get('/banks')
      this.banks = res.data
    },

    async fetchAccounts() {
      const res = await api.get('/accounts')
      this.accounts = res.data
      if(this.accounts.length > 0) this.selectedAccountId = this.accounts[0].id
    },

    async createAccount() {
      if (!this.newAccount.bank_id || !this.newAccount.account_number) {
        alert("入力してください")
        return
      }
      await api.post('/accounts', { account: this.newAccount })
      alert("口座登録しました")
      await this.fetchAccounts()
      bootstrap.Modal.getInstance(this.$refs.accountModal).hide()
      this.newAccount = { bank_id: "", account_number: '', balance: 0 }
    },

    async createTransaction() {
      if (!this.newTransaction.transaction_type) {
        alert('収支種別を選択してください')
        return
      }

      if (this.newTransaction.transaction_type === "income") {
        this.newTransaction.category = "収入"
      }

      if (
        this.newTransaction.payment_method === "引き落とし" &&
        !this.selectedAccountId
      ) {
        alert("口座を選択してください")
        return
      }

      const payload = {
        transaction: {
          ...this.newTransaction,
          account_id:
            this.newTransaction.payment_method === "引き落とし"
              ? this.selectedAccountId
              : null
        }
      }

      if (this.editingId) {
        await api.patch(`/transactions/${this.editingId}`, payload)
        alert('更新しました')
      } else {
        await api.post('/transactions', payload)
        alert('追加しました')
        if (this.newTransaction.transaction_type === 'income') {
          await api.patch(`/accounts/${this.selectedAccountId}/add_balance`, {
            amount: Number(this.newTransaction.amount)
          })
        } else if (this.newTransaction.transaction_type === 'expense') {
          await api.patch(`/accounts/${this.selectedAccountId}/subtract_balance`, {
            amount: Number(this.newTransaction.amount)
          })
        }
      }

      await this.fetchTransactions()
      await this.fetchAccounts()

      bootstrap.Modal.getInstance(this.$refs.transactionModal).hide()
    },

    async deleteTransaction() {
      if(!confirm('この記録を削除しますか？')) return
      await api.delete(`/transactions/${this.editingId}`)
      alert('削除しました')
      await this.fetchTransactions()
      bootstrap.Modal.getInstance(this.$refs.transactionModal).hide()
    },

    resetForm() {
      this.editingId = null
      this.newTransaction = {
        transaction_type:'', category:'', amount:0, date:'', payment_method:''
      }
    },

    goProfile() {
      this.$router.push('/profile')
    },
    
    logout() {
      localStorage.removeItem('token')
      alert('ログアウトしました')
      this.$router.push('/login')
    },

    async sendMessage() {
      const message = this.chatInput

      if (!message.trim()) return

      this.messages.push({
        role: "user",
        text: message
      })

      this.chatInput = ""

      try {
        const res = await api.post("/chat", {
          message: message
        })

        this.messages.push({
          role: "bot",
          text: res.data.reply
        })
      } catch (error) {
        this.messages.push({
          role: "bot",
          text: "エラーが発生しました。"
        })
        console.error(error)
      }
    }

  },

  async mounted() {
    const userStr = localStorage.getItem("currentUser")
    this.currentUser = userStr ? JSON.parse(userStr) : null

    await this.fetchBanks()
    await this.fetchAccounts()
    await this.fetchTransactions()
  },

}
</script>

<style scoped>

.page {
  width:100%;
  min-height:100vh;
  overflow-x:hidden;
  position: relative;
}


.dashboard-container { 
  width:100%;
  min-height:100vh;
  padding:20px;
  box-sizing:border-box;
}

.top-row {
  display:grid;
  grid-template-columns: 1.2fr 1.3fr 0.7fr;
  gap:20px;
  width:100%;
  min-height:520px;
}

.calendar-wrapper,
.chart-wrapper,
.my-panel {

  background:rgba(0,0,0,0.65);
  border-radius:20px;
  padding:10px;
  box-sizing:border-box;
  color: white;
  min-height: 200px;
  min-width: 0;
}

.bottom-row {
  margin-top:30px;
}

.bottom-row .chart-wrapper {
  height:220px;
}

.fc {
  width:100%;
}

.fc-view-harness {
  min-height:500px;
}

.top-menu{
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.summary {
  display:flex; 
  justify-content:space-between;
  margin-bottom:10px; 
  padding:8px; 
  background-color:rgba(0,0,0,0.7);
  border-radius:10px;
  flex-wrap: wrap;
  gap: 5px;
}

.summary-item { 
  font-weight:bold; 
  padding:4px 8px; 
  border-radius:20px; 
}

.summary-item.income { background-color:#3b82f6; color:white; }
.summary-item.expense { background-color:#ef4444; color:white; }
.summary-item.balance { background-color:#10b981; color:white; }

.chart-title { 
  text-align:center; 
  font-weight:bold; 
  margin-bottom :10px; 
  font-size:22px; 
}

@media (max-width: 768px) {
  .top-row {
    flex-direction: column;
  }

  .calendar-wrapper,
  .chart-wrapper,
  .my-panel {
    max-width: 100%;
    flex: none;
  }

  .chart-title {
    font-size: 18px;
  }
}

.top-menu {
  position: fixed;
  top:20px;
  right:20px;
  z-index:9999;
}


.chat-button {
  position: fixed;
  right:25px;
  bottom:25px;
  z-index:99999;

  width:60px;
  height:60px;

  border-radius:50%;
  border:none;

  cursor:pointer;
}

.chat-window {

  position: fixed;

  right:25px;
  bottom:100px;

  width:350px;
  height:450px;

  background:white;

  border-radius:20px;

  box-shadow:0 10px 30px rgba(0,0,0,.3);

  z-index:99999;

  display:flex;
  flex-direction:column;

  overflow:hidden;

}

.chat-header{

  padding:15px;

  background:#4f46e5;

  color:white;

  display:flex;

  justify-content:space-between;
}

.chat-body{

  flex:1;

  overflow:auto;

  padding:15px;
}

.chat-footer{

  display:flex;

  padding:10px;

  gap:10px;
}

.user{

  text-align:right;

  margin-bottom:10px;
}

.bot{

  text-align:left;

  margin-bottom:10px;
}

::v-deep(.apexcharts-tooltip) {
  color: #000 !important;
}

::v-deep(.apexcharts-tooltip-title) {
  color: #000 !important;
}

::v-deep(.apexcharts-tooltip-text) {
  color: #000 !important;
}

::v-deep(.apexcharts-tooltip-series-group) {
  color: #000 !important;
}

.blob-background{

  position:fixed;

  inset:0;

  overflow:hidden;

  z-index:0;

  pointer-events:none;

}

.blob{

  position:absolute;

  border-radius:50%;

  filter:blur(90px);

  opacity:0.45;

  animation:blobMove 20s infinite alternate ease-in-out;

}

.blob1{

  width:500px;
  height:500px;

  background:#60a5fa;

  top:-150px;
  left:-120px;

}

.blob2{

  width:450px;
  height:450px;

  background:#c084fc;

  right:-100px;
  top:200px;

  animation-delay:5s;

}

.blob3{

  width:550px;
  height:550px;

  background:#67e8f9;

  bottom:-200px;
  left:35%;

  animation-delay:10s;

}

@keyframes blobMove{


  0%{

    transform:
      translate(0,0)
      scale(1);

  }

  50%{

    transform:
      translate(80px,50px)
      scale(1.2);

  }

  100%{

    transform:
      translate(-50px,100px)
      scale(0.9);

  }

}

</style>