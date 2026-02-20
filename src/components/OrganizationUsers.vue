<template>
  <div>
    <h2>組織のユーザー一覧</h2>

    <div v-if="loading">読み込み中...</div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <ul v-else>
      <li v-for="user in users" :key="user.id">
        {{ user.username }}
      </li>
    </ul>
  </div>
</template>

<script>
import api from '@/plugins/axios'

export default {
  name: 'OrganizationUsers',

  data() {
    return {
      users: [],
      loading: true,
      error: null
    }
  },

  async mounted() {
    await this.fetchUsers()
  },

  methods: {
    async fetchUsers() {
      try {
        const token = localStorage.getItem('jwt')

        if (!token) {
          this.error = 'ログインしてください'
          return
        }

        const res = await api.get('/users', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        this.users = res.data
      } catch (err) {
        console.error(err)
        this.error = 'ユーザー一覧の取得に失敗しました'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.error {
  color: red;
}
</style>
