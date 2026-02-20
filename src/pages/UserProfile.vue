<template>
  <div>
    <h2>プロフィール編集</h2>

    <div v-if="user">
      <p>ユーザー名: {{ user.username }}</p>

      <label>所属組織</label>
      <select v-model="organization_id">
        <option v-for="org in orgs" :key="org.id" :value="org.id">
          {{ org.name }}
        </option>
      </select>

      <button @click="updateOrganization">変更する</button>
    </div>
  </div>
</template>

<script>
import api from '@/plugins/axios'

export default {
  name: 'UserProfile',
  
  data() {
    return {
      user: null,
      orgs: [],
      organization_id: null
    }
  },

  async mounted() {
    await this.fetchUser()
    await this.fetchOrgs()
  },

  methods: {
    getAuthHeader() {
      const token = localStorage.getItem('token')

      // 🔍 ここでログを出す
      console.log("token:", token)

      return { Authorization: `Bearer ${token}` }
    },

    async fetchOrgs() {
      const res = await api.get('/organizations', {
        headers: this.getAuthHeader()
      })
      this.orgs = res.data
    },

    async fetchUser() {
      const user = JSON.parse(localStorage.getItem('user'))
      this.user = user
      this.organization_id = user.organization_id
    },

    async updateOrganization() {
      // 🔍 headerログ
      console.log("updateOrganization header:", this.getAuthHeader())

      try {
        const res = await api.patch(
          `/users/${this.user.id}`,
          {
            user: {
              organization_id: this.organization_id
            }
          },
          {
            headers: this.getAuthHeader()
          }
        )

        alert('組織を変更しました')

        this.user.organization_id = res.data.organization_id
        localStorage.setItem('user', JSON.stringify(this.user))
      } catch (error) {
        console.error("updateOrganization ERROR:", error.response?.data || error)
        alert("組織変更に失敗しました")
      }
    }
  }
}
</script>
