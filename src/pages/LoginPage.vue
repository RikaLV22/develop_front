<template>
  <div>
    <h2>ログイン</h2>

    <form @submit.prevent="login">
      <div>
        <label for="username">ユーザー名:</label>
        <input type="text" id="username" v-model="username" required />
      </div>

      <div>
        <label for="password">パスワード:</label>
        <input type="password" id="password" v-model="password" required />
      </div>

      <button type="submit">ログイン</button>
    </form>

    <p v-if="error" style="color: red;">{{ error }}</p>
  </div>
</template>

<script>
import api from '@/plugins/axios'

export default {
  name: 'LoginPage',
  data() {
    return {
      username: '',
      password: '',
      error: ''
    }
  },
  methods: {
    async login() {
      this.error = ''

      try {
        const res = await api.post('/login', {
          username: this.username,
          password: this.password
        })

        localStorage.setItem('token', res.data.token)
        localStorage.setItem('user', JSON.stringify(res.data.user))

        alert(`ログイン成功: ${res.data.user.username}`)

        this.$router.push('/users')
      } catch (err) {
        if (err.response && err.response.data) {
          this.error = err.response.data.message || 'ログイン失敗'
        } else {
          this.error = 'ログイン失敗'
        }
      }
    }
  }
}
</script>

<style scoped>
form div {
  margin-bottom: 10px;
}

label {
  margin-right: 10px;
  display: inline-block;
  width: 120px;
}
</style>
