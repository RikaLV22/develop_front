<template>
  <div>
    <h2>組織変更</h2>

    <form @submit.prevent="changeOrganization">
      <label for="orgId">新しい組織ID:</label>
      <input v-model="newOrgId" id="orgId" required />

      <button type="submit">変更する</button>
    </form>

    <p v-if="message" style="color: green;">{{ message }}</p>
    <p v-if="error" style="color: red;">{{ error }}</p>
  </div>
</template>

<script>
import api from "@/plugins/axios";

export default {
  name: "MyPage",
  data() {
    return {
      newOrgId: "",
      message: "",
      error: ""
    };
  },
  methods: {
    async changeOrganization() {
      this.message = "";
      this.error = "";

      const userJson = localStorage.getItem("user");
      const user = userJson ? JSON.parse(userJson) : null;
      if (!user) {
        this.error = "ログインしてください";
        return;
      }

      try {
        const token = localStorage.getItem("token");

        const res = await api.patch(
          `/users/${user.id}`,
          {
            user: { organization_id: this.newOrgId }
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        localStorage.setItem("user", JSON.stringify(res.data));
        this.message = "組織変更が完了しました！";
      } catch (err) {
        this.error = err.response?.data?.error || "変更失敗";
      }
    }
  }
};
</script>
