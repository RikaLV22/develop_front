<template>
  <div>
    <h2>ユーザーと組織を作成</h2>

    <form @submit.prevent="createCombined">
      <div>
        <label for="userName">ユーザー名:</label>
        <input
          type="text"
          id="userName"
          v-model="formData.userName"
          required
        />
      </div>

      <div>
        <label for="organizationName">組織名:</label>
        <input
          type="text"
          id="organizationName"
          v-model="formData.organizationName"
          required
        />
      </div>

      <div>
        <label for="password">パスワード:</label>
        <input
          type="password"
          id="password"
          v-model="formData.password"
          required
        />
      </div>

      <button type="submit">登録</button>
    </form>
  </div>
</template>

<script>
import api from '@/plugins/axios'

export default {
  name: 'CreateUserAndOrganization',

  data() {
    return {
      formData: {
        userName: '',
        organizationName: '',
        password: '' 
      }
    }
  },

  methods: {
    async createCombined() {
      try {
        const orgRes = await api.post('/organizations', {
          organization: {
            name: this.formData.organizationName
          }
        })

        const orgId = orgRes.data.id
        const orgName = orgRes.data.name

        const userRes = await api.post('/users', {
          user: {
            username: this.formData.userName,
            organization_id: orgId,
            password: this.formData.password
          }
        })

        localStorage.setItem('token', userRes.data.token)
        localStorage.setItem('user', JSON.stringify(userRes.data.user))

        alert(
          `登録成功\nUser: ${userRes.data.user.username}\nOrganization: ${orgName}`
        )

        this.formData.userName = ''
        this.formData.organizationName = ''
        this.formData.password = ''

        this.$router.push('/login')

      } catch (error) {
        if (error.response?.data) {
          console.error('Rails ERROR:', error.response.data)
          alert(
            `登録に失敗しました:\n${JSON.stringify(error.response.data)}`
          )
        } else {
          console.error(error)
          alert('登録に失敗しました')
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
