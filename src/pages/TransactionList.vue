<template>
  <div>

    <full-calendar
      ref="calendar"
      :plugins="[ dayGridPlugin, interactionPlugin ]"
      :events="calendarEvents"
      defaultView="dayGridMonth"
      :local="jalocal"
      style="height: 600px;"
    ></full-calendar>

    <div class="modal fade" ref="transactionModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingId ? '家計簿を編集' : '家計簿をつける' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          
          <div class="modal-body">
            <form>
              <div class="mb-3">
                <label class="form-label">収支種別</label>
                <select class="form-select" v-model="newTransaction.transaction_type">
                  <option value="">選択してください</option>
                  <option value="income">収入</option>
                  <option value="expense">支出</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">カテゴリー</label>
                <template v-if="newTransaction.transaction_type === 'income'">
                  <input type="text" class="form-control" value="収入" readonly>
                </template>
                <template v-else-if="newTransaction.transaction_type === 'expense'">
                  <select class="form-select" v-model="newTransaction.category">
                    <option value="">選択してください</option>
                    <option value="食費">食費</option>
                    <option value="交通費">交通費</option>
                    <option value="趣味">趣味</option>
                    <option value="水道光熱費">水道光熱費</option>
                    <option value="家賃">家賃</option>
                    <option value="衣類費">衣類費</option>
                    <option value="医療費">医療費</option>
                    <option value="交際費">交際費</option>
                    <option value="日用品費">日用品費</option>
                    <option value="通信費">通信費</option>
                    <option value="その他">その他</option>
                  </select>
                </template>
              </div>

              <div class="mb-3">
                <label class="form-label">金額</label>
                <input type="number" class="form-control" v-model="newTransaction.amount">
              </div>

              <div class="mb-3">
                <label class="form-label">日付</label>
                <input type="date" class="form-control" v-model="newTransaction.date">
              </div>

              <div class="mb-3">
                <label class="form-label">支払方法</label>
                <template v-if="newTransaction.transaction_type === 'income'">
                  <input type="text" class="form-control" value="-" readonly>
                </template>
                <template v-else-if="newTransaction.transaction_type === 'expense'">
                  <select class="form-select" v-model="newTransaction.payment_method">
                    <option value="">選択してください</option>
                    <option value="現金">現金</option>
                    <option value="クレジット">クレジット</option>
                    <option value="引き落とし">引き落とし</option>
                  </select>
                </template>
              </div>
            </form>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">閉じる</button>
            <button type="button" class="btn btn-primary" @click="createTransaction">
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
import * as bootstrap from 'bootstrap'

export default {
  name: 'TransactionList',
  components: { FullCalendar },
  data() {
    return {
      transactions: [],
      calendarEvents: [],
      editingId: null,
      newTransaction: {
        transaction_type: '',
        category: '',
        amount: 0,
        date: '',
        payment_method: ''
      },
      dayGridPlugin,
      interactionPlugin
    }
  },
  async mounted() {
    await this.fetchTransactions()

    const calendar = this.$refs.calendar.getApi()
    calendar.on('dateClick', this.openModalForDate)
    calendar.on('eventClick', this.openModalForEvent)
  },
  methods: {
    async fetchTransactions() {
      const res = await api.get('/transactions')
      this.transactions = res.data

      this.calendarEvents = res.data.map(t => ({
        id: t.id,
        title: `${t.transaction_type === 'income' ? '+' : '-'}${t.amount}円`,
        start: t.date,
        color: t.transaction_type === 'income' ? 'blue' : 'red'
      }))
    },

    openModalForDate(info) {
      this.resetForm()
      this.newTransaction.date = info.dateStr
      new bootstrap.Modal(this.$refs.transactionModal).show()
    },

    openModalForEvent(info) {
      const t = this.transactions.find(x => x.id == info.event.id)
      if (!t) return
      this.editTransaction(t)
      new bootstrap.Modal(this.$refs.transactionModal).show()
    },

    async createTransaction() {
      if (!this.newTransaction.transaction_type) {
        alert('収支種別を選択してください')
        return
      }

      if (this.editingId) {
        await api.patch(`/transactions/${this.editingId}`, { transaction: this.newTransaction })
        alert('更新しました')
      } else {
        await api.post('/transactions', { transaction: this.newTransaction })
        alert('追加しました')
      }

      await this.fetchTransactions()

      const modal = bootstrap.Modal.getInstance(this.$refs.transactionModal)
      modal.hide()
    },

    editTransaction(t) {
      this.editingId = t.id
      this.newTransaction = { ...t }
    },

    resetForm() {
      this.editingId = null
      this.newTransaction = {
        transaction_type: '',
        category: '',
        amount: 0,
        date: '',
        payment_method: ''
      }
    }
  }
}
</script>

<style scoped>
.fc {
  max-width: 900px;
  margin: 40px auto;
}
</style>