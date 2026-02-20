<template>
  <div id="ip">
    <div>
      <h2>SubItem</h2>
      <p>ここに郵便番号1000001の住所が表示します</p>
      <p>{{address}}</p>
      <div>
        <b-button
          size="lg"
          variant="outline-primary"
          @click="getAddress"
        >
        取得
        </b-button>
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">
  export default {
    name: 'SubItem',
    data() {
      return {
        address: ''
      }
    },
    methods: {
      getAddress() {
        this.address = '住所を取得しています';
        this.$axios.get('https://api.zipaddress.net/?zipcode=1000001')
          .then((response) => {
            this.address = response.data.data.fullAddress;
            console.log(response)
          })
          .catch(() => {
            this.address = '取得に失敗しました';
          });
      }
    }
  }
</script>

<style scoped>
</style>
