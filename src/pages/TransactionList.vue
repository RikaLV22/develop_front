<template>
  <div class="dashboard-container">

    <div class="calendar-wrapper">
      <div class="summary">
        <div class="summary-item income">収入: {{ totalIncome }}円</div>
        <div class="summary-item expense">支出: {{ totalExpense }}円</div>
        <div class="summary-item balance">残金: {{ balance }}円</div>
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
        height="100%"
      />
    </div>

    <div class="modal fade" ref="transactionModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingId ? '家計簿を編集' : '家計簿をつける' }}</h5>
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
                <input type="number" class="form-control" v-model="newTransaction.amount" />
              </div>

              <div class="mb-3">
                <label>日付</label>
                <input type="date" class="form-control" v-model="newTransaction.date" />
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
            <button class="btn btn-secondary" data-bs-dismiss="modal">閉じる</button>
            <button class="btn btn-primary" @click="createTransaction">
              {{ editingId ? '更新' : '追加' }}
            </button>
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
          '#3b82f6','#ef4444','#f97316','#facc15','#8b5cf6','#ec4899','#14b8a6','#f43f5e','#60a5fa','#a3e635','#f87171'
        ],
        legend: { position: 'bottom', labels: { colors: '#ffffff' }, fontSize: '16px', fontWeight: 600 },
        chart: { height: '100%' }
      }
    }
  },
  computed: {
    dynamicChartOptions() {
      return { ...this.baseChartOptions, labels: this.chartLabels }
    },
    totalIncome() {
      return this.transactions.filter(t => t.transaction_type==='income')
        .reduce((sum,t)=>sum+Number(t.amount),0)
    },
    totalExpense() {
      return this.transactions.filter(t => t.transaction_type==='expense')
        .reduce((sum,t)=>sum+Number(t.amount),0)
    },
    balance() {
      return this.totalIncome - this.totalExpense
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
        color: t.transaction_type==='income'?'blue':'red'
      }))

      const income = this.transactions.filter(t => t.transaction_type==='income')
        .reduce((sum,t)=>sum+Number(t.amount),0)

      const expenses = this.transactions.filter(t => t.transaction_type==='expense')
      const categoryMap = {}
      expenses.forEach(e=>{
        if(!e.category) return
        categoryMap[e.category] = (categoryMap[e.category]||0)+Number(e.amount)
      })

      this.chartSeries = [income, ...Object.values(categoryMap)]
      this.chartLabels = ['収入', ...Object.keys(categoryMap)]
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
      if(!this.newTransaction.transaction_type){ alert('収支種別を選択してください'); return }
      if(this.editingId){
        await api.patch(`/transactions/${this.editingId}`, {transaction: this.newTransaction})
        alert('更新しました')
      } else {
        await api.post('/transactions',{transaction: this.newTransaction})
        alert('追加しました')
      }
      await this.fetchTransactions()
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
      this.editingId=null
      this.newTransaction={
        transaction_type:'',
        category:'',
        amount:0,
        date:'',
        payment_method:''
      }
    }
  },
  async mounted() {
    await this.fetchTransactions()
  }
}
</script>

<style scoped>
.dashboard-container { 
  display:flex; gap:20px; align-items:flex-start; }

.calendar-wrapper { flex:0 0 600px; }

.summary {
  display:flex; justify-content:space-between;
  margin-bottom:10px; padding:8px; background-color:#555d6e;
  border-radius:10px;
}

.summary-item { font-weight:bold; padding:4px 8px; border-radius:20px; }
.summary-item.income { background-color:#3b82f6; color:white; }
.summary-item.expense { background-color:#ef4444; color:white; }
.summary-item.balance { background-color:#10b981; color:white; }

.chart-wrapper {
  flex:1.5; min-width:650px; max-width:900px; height:500px;
  background-color:#555d6e; border-radius:20px;
  display:flex; flex-direction:column; align-items:center;
  justify-content:flex-start; padding:15px; overflow-y:auto;
}

.chart-title { 
  text-align:center; font-weight:bold; margin: bottom 5px; font-size:35px; }

.apexcharts-legend {
  margin-top: 5px !important;}

.fc { width:100%; height:500px; }
</style>