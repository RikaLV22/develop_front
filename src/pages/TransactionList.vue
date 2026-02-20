<template>
  <div>

    <div class="header">
      <h2>家計簿一覧</h2>
      <div class="nav">
        <button @click="goHome">Home</button>
        <button @click="goProfile">My Profile</button>
        <button @click="logout">Logout</button>
      </div>
    </div>

    <table border="1">
      <thead>
        <tr>
          <th>日付</th>
          <th>種別</th>
          <th>カテゴリ</th>
          <th>金額</th>
          <th>支払方法</th>
          <th>操作</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="t in transactions" :key="t.id">
          <td>{{ t.date }}</td>
          <td>{{ t.transaction_type === 'income' ? '収入' : '支出' }}</td>
          <td>{{ t.category }}</td>
          <td>{{ t.amount }} 円</td>
          <td>{{ t.transaction_type === 'income' ? '-' : t.payment_method }}</td>
          <td>
            <button @click="editTransaction(t)">編集</button>
            <button @click="deleteTransaction(t.id)">削除</button>
          </td>
        </tr>
      </tbody>
    </table>

    <hr />

    <h3>新規入力</h3>
    <form @submit.prevent="createTransaction">

      <label>種別</label>
      <select v-model="newTransaction.transaction_type" required>
        <option value="income">収入</option>
        <option value="expense">支出</option>
      </select>

      <div v-if="newTransaction.transaction_type === 'expense'">
        <label>カテゴリ</label>
        <select v-model="newTransaction.category" required>
          <option>食費</option>
          <option>交通費</option>
          <option>水道光熱費</option>
          <option>家賃</option>
          <option>衣類</option>
          <option>医療費</option>
          <option>交際費</option>
          <option>日用品</option>
          <option>通信費</option>
          <option>その他</option>
        </select>
      </div>

      <label>金額</label>
      <input type="number" v-model.number="newTransaction.amount" required />

      <label>日付</label>
      <input type="date" v-model="newTransaction.date" required />

      <div v-if="newTransaction.transaction_type === 'expense'">
        <label>支払方法</label>
        <select v-model="newTransaction.payment_method" required>
          <option>現金</option>
          <option>クレカ</option>
        </select>

        <div v-if="newTransaction.payment_method === 'クレカ'">
          <label>カード番号</label>
          <input v-model="newTransaction.card_number" />
        </div>
      </div>

      <br />
      <button type="submit">追加</button>
    </form>

  </div>
</template>

<script>
import api from '@/plugins/axios'

export default {
  name: 'TransactionList',

  data() {
    return {
      transactions: [],
      newTransaction: {
        transaction_type: '',
        category: '',
        amount: 0,
        date: '',
        payment_method: '',
        card_number: ''
      }
    }
  },

  async mounted() {
    await this.fetchTransactions()
  },

  methods: {

    async fetchTransactions() {
      try {
        const res = await api.get('/transactions')
        this.transactions = res.data
      } catch (err) {
        console.error('取引一覧取得失敗:', err)
      }
    },

    async createTransaction() {
      try {
        if (this.newTransaction.transaction_type === 'income') {
          this.newTransaction.category = '収入'
          this.newTransaction.payment_method = ''
          this.newTransaction.card_number = ''
        }

        await api.post('/transactions', { transaction: this.newTransaction })
        alert('追加しました')

        await this.fetchTransactions()

        this.resetForm()
      } catch (err) {
        console.error('登録失敗:', err)
        alert('登録に失敗しました')
      }
    },

    async deleteTransaction(id) {
      if (!confirm('削除しますか？')) return
      try {
        await api.delete(`/transactions/${id}`)
        await this.fetchTransactions()
      } catch (err) {
        console.error('削除失敗:', err)
      }
    },

    editTransaction(t) {
      alert(`${t.transaction_type === 'income' ? '収入' : '支出'}の編集機能はここに追加できます`)
    },

    goProfile() {
      this.$router.push('/profile')
    },

    goHome() {
      this.$router.push('/')
    },

    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.$router.push('/login')
    },

    resetForm() {
      this.newTransaction = {
        transaction_type: '',
        category: '',
        amount: 0,
        date: '',
        payment_method: '',
        card_number: ''
      }
    }
  }
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.nav button {
  margin-left: 10px;
}
</style>