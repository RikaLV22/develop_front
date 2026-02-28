<template>
  <div>
    <h2>家計簿へようこそ！</h2>

    <div v-if="!loggedIn">
      <router-link to="/login">
        <button>ログイン</button>
      </router-link>

      <router-link to="/usercreate">
        <button>ユーザー新規作成</button>
      </router-link>
    </div>

    <div v-else>
      <p>こんにちは、{{ username }}さん！</p>
      <router-link to="/transactions">
        <button>家計簿を見る</button>
      </router-link>
      <button @click="logout">ログアウト</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loggedIn: false,
      username: ''
    }
  },
  mounted() {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user && localStorage.getItem('token')) {
      this.loggedIn = true
      this.username = user.username
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      this.loggedIn = false
      this.username = ''
      this.$router.push('/')
    }
  }
}
</script>
