<template>

<div class="page">

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
          height="600"
          width="400"
        />

      </div>

      <div class="my-panel">
        <h5>あなたの収支</h5>
        <p>総収入: {{ totalIncome }}円</p>
        <p>総支出: {{ totalExpense }}円</p>
        <p>残金: {{ balance }}円</p>
      </div>

    </div>


    <div class="bottom-row">

      <div class="chart-wrapper">

        <h4 class="chart-title">ユーザー別支出割合</h4>

        <apexchart
          type="bar"
          :options="userPercentOptions"
          :series="userPercentSeries"
          height="200"
          width="1720"
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
      editingId: null,

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
          offsetY: -40,
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
      }
    }
  },

  computed: {
    dynamicChartOptions() {
      return { ...this.baseChartOptions, labels: this.chartLabels }
    },

    totalIncome() {
      return this.transactions
        .filter(t => t.transaction_type === 'income')
        .reduce((sum,t)=>sum+Number(t.amount),0)
    },

    totalExpense() {
      return this.transactions
        .filter(t => t.transaction_type === 'expense')
        .reduce((sum,t)=>sum+Number(t.amount),0)
    },

    balance() {
      return this.totalIncome - this.totalExpense
    }
  },

  methods: {

    async fetchTransactions() {
    
      const res = await api.get('/transactions')
      console.log(res.data)
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

        if (!userMap[name]) {
          userMap[name] = 0
        }

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

    async createTransaction() {

      if(!this.newTransaction.transaction_type){
        alert('収支種別を選択してください')
        return
      }

      if(this.editingId){
        await api.patch(`/transactions/${this.editingId}`,
          {transaction: this.newTransaction})
        alert('更新しました')
      } else {
        await api.post('/transactions',
          {transaction: this.newTransaction})
        alert('追加しました')
      }

      await this.fetchTransactions()

      bootstrap.Modal
        .getInstance(this.$refs.transactionModal)
        .hide()
    },


    async deleteTransaction() {

      if(!confirm('この記録を削除しますか？')) return

      await api.delete(`/transactions/${this.editingId}`)

      alert('削除しました')

      await this.fetchTransactions()

      bootstrap.Modal
        .getInstance(this.$refs.transactionModal)
        .hide()
    },


    resetForm() {

      this.editingId = null

      this.newTransaction = {
        transaction_type:'',
        category:'',
        amount:0,
        date:'',
        payment_method:''
      }

    },
    goProfile() {
      this.$router.push('/profile')
    },
    
    logout() {
      localStorage.removeItem('token')
      alert('ログアウトしました')
      this.$router.push('/login')
    }
  },

  async mounted() {
    await this.fetchTransactions()
  }
}
</script>

<style scoped>
.dashboard-container { 
  display:flex; 
  gap:20px; 
  flex-direction: column;
  max-width: 100%;
  width: 100%;
  margin: 0 auto;
  padding-top: 5px;
}

.top-row {
  display: flex;
  gap: 20px;
  align-items: stretch;
  justify-content: flex-start;
  width: 100%;
  height: auto;
  flex-wrap: nowrap;
}

.bottom-row {
  display: flex;
  justify-content: center;
  gap: 15;
  min-width: 1750px;
  max-width: 1300px;
  flex-direction: column;
  align-items: stretch;
  overflow: hidden;
}

.bar-chart {
  width: 100%;
  max-width: none;
}

.calendar-wrapper { 
  flex: 0 0 600px;
  background-color: rgba(0,0,0,0.7);
  border-radius: 20px;
  padding: 10px;
}

.summary {
  display:flex; 
  justify-content:space-between;
  margin-bottom:10px; 
  padding:8px; 
  background-color:rgba(0,0,0,0.7);
  border-radius:10px;
}

.summary-item { font-weight:bold; padding:4px 8px; border-radius:20px; }
.summary-item.income { background-color:#3b82f6; color:white; }
.summary-item.expense { background-color:#ef4444; color:white; }
.summary-item.balance { background-color:#10b981; color:white; }

.chart-wrapper {
  flex:1; 
  min-width:550px; 
  width:2000; 
  height:567px;
  background-color: rgba(0,0,0,0.7);
  color: white; 
  border-radius:20px;
  display:flex; 
  flex-direction:column; 
  align-items:center;
  justify-content:flex-start; 
  padding:20px; 
  overflow:hidden;
}

.chart-title { 
  text-align:center; 
  font-weight:bold; 
  margin-bottom :5px; 
  font-size:35px; 
}

.apexcharts-legend {
  margin-top: 5px !important;}

.fc { 
  width:100%; 
  height:500px; 
  color: white;
  }

.top-menu{
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

html, body {
  height: 100%;
  margin: 0;
}

#app {
  min-height: 100vh;
}

body {
  margin: 0;
}

.my-panel {
  width: 250px;
  background-color: rgba(0,0,0,0.7);
  border-radius: 20px;
  color: white;
  padding: 20px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
}

.calendar-header {
  position: absolute;
  left: 180px;
  top: 108px;
  color: white;
  font-size: 22px;
  font-weight: bold;
}

:deep(.apexcharts-tooltip) {
  background: white !important;
  color: black !important;
}

:deep(.apexcharts-tooltip-title) {
  color: black !important;
}

:deep(.apexcharts-tooltip-text-y-value) {
  color: black !important;
}

:deep(.apexcharts-tooltip-text-y-label){
  color: black !important;
}
</style>