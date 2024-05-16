<template>
  <a-layout>
    <a-layout-content class="container">
      <div class="page">
        <RouterLink to="/" class="index-part logo-a">
          <div class="site-title">
            <img src="/src/assets/logo.svg" class="logo"/>
            <div>
              网络文件管理系统
            </div>
          </div>
        </RouterLink>
        <div class="index-part">
          <RouterView/>
        </div>
      </div>
    </a-layout-content>
  </a-layout>
</template>
<script setup>
</script>
<style scoped>
.page {
  width: 100vw;
  height: 60vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
}

.index-part {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.index-part:nth-child(2) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-left: 1px solid #aaa;
}

.logo {
  width: 10vw;
}

.logo-a, .logo-a:hover, .logo-a:active, .logo-a:visited {
  color: black;
}

.container {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}


.site-title {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.site-title > div {
  white-space: nowrap;
  font-size: 3rem;
  margin-left: 3rem;
}
</style>