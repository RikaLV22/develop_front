<template>
  <div>
    <h2>組織のユーザー一覧</h2>
    <ul>
      <li v-for="user in users" :key="user.id">
        {{ user.username }}
      </li>
    </ul>
  </div>
</template>

<script>
import api from '@/plugins/axios'

export default {
  data() {
    return {
      users: []
    }
  },
  async mounted() {
    const res = await api.get('/users')
    this.users = res.data
  }
}
</script>