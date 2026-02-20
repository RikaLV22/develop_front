<template>
  <div>
    <div class="header">
      <h2>プロフィール</h2>
      <div class="nav">
        <button @click="goHome">Home</button>
        <button @click="logout">Logout</button>
      </div>
    </div>

    <div class="profile-info">
      <p><strong>ユーザー名:</strong> {{ user.username }}</p>
      <p><strong>ユーザーID:</strong> {{ user.id }}</p>
      <p><strong>所属組織名:</strong> {{ organization.name }}</p>
      <p><strong>所属組織ID:</strong> {{ organization.id }}</p>
    </div>

    <div class="members">
      <h3>同じ組織のメンバー</h3>
      <ul>
        <li v-for="member in members" :key="member.id">{{ member.username }}</li>
      </ul>
    </div>

    <div class="change-org">
      <h3>組織変更</h3>
      <form @submit.prevent="changeOrganization">
        <label for="orgId">新しい組織ID:</label>
        <input v-model="newOrgId" id="orgId" required />
        <button type="submit">変更する</button>
      </form>
      <p v-if="message" style="color: green">{{ message }}</p>
      <p v-if="error" style="color: red">{{ error }}</p>
    </div>
  </div>
</template>

<script>
import api from "@/plugins/axios";

export default {
  name: "MyProfile",
  data() {
    return {
      user: {},
      organization: {},
      members: [],
      newOrgId: "",
      message: "",
      error: ""
    };
  },
  async mounted() {
    const userJson = localStorage.getItem("user");
    if (!userJson) {
      this.$router.push("/login");
      return;
    }
    this.user = JSON.parse(userJson);

    try {
      const token = localStorage.getItem("token");

      const orgRes = await api.get(`/organizations/${this.user.organization_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.organization = orgRes.data;

      const membersRes = await api.get(`/organizations/${this.user.organization_id}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.members = membersRes.data.filter(u => u.id !== this.user.id);

    } catch (err) {
      this.error = err.response?.data?.error || "情報取得に失敗しました";
    }
  },
  methods: {
    async changeOrganization() {
      this.message = "";
      this.error = "";

      const token = localStorage.getItem("token");
      if (!token) {
        this.error = "ログインしてください";
        return;
      }

      try {
        const res = await api.patch(
          `/users/${this.user.id}`,
          { user: { organization_id: this.newOrgId } },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.user = res.data;
        localStorage.setItem("user", JSON.stringify(res.data));
        this.message = "組織変更が完了しました！";

        const orgRes = await api.get(`/organizations/${this.user.organization_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.organization = orgRes.data;

        const membersRes = await api.get(`/organizations/${this.user.organization_id}/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.members = membersRes.data.filter(u => u.id !== this.user.id);

      } catch (err) {
        this.error = err.response?.data?.error || "変更失敗";
      }
    },

    goHome() {
      this.$router.push("/");
    },

    logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      this.$router.push("/login");
    }
  }
};
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

.profile-info p {
  margin: 5px 0;
}

.members {
  margin-top: 20px;
}

.change-org {
  margin-top: 20px;
}
</style>