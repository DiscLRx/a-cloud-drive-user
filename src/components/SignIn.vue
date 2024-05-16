<template>
  <a-form :model="form"
          name="basic"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 16 }">
    <a-form-item label="用户名" name="username">
      <a-input v-model:value="form.username"/>
    </a-form-item>
    <a-form-item label="密码" name="password">
      <a-input-password v-model:value="form.password"/>
    </a-form-item>
    <a-form-item style="margin: -1rem 0" :wrapper-col="{ offset: 8}">
      <RouterLink style="float: right" to="/forget">忘记密码</RouterLink>
    </a-form-item>
    <a-form-item :wrapper-col="{ offset: 8}">
      <a-button type="primary" html-type="button" @click="signIn">登录</a-button>
      <RouterLink to="/sign-up">
        <a-button type="default" html-type="button" :style="{ marginLeft: '1rem' }">注册</a-button>
      </RouterLink>
    </a-form-item>
  </a-form>
</template>

<script setup>
import {onMounted, reactive} from 'vue';
import router from "/src/router.js";
import {message} from "ant-design-vue";

onMounted(() => {
  if (localStorage.getItem("token") !== null) {
    router.push('/main/files')
  }
})

const form = reactive({
  username: '',
  password: ''
})

const signIn = () => {
  fetch('/api/identity/auth/sign-in', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(form)
  })
      .then(res => res.json())
      .then(res => {
        if (res.code === 0) {
          localStorage.setItem('token', res.data.token)
          localStorage.setItem('displayName', res.data.displayName)
          localStorage.removeItem('rootId')
          router.push('/main/files')
        } else if (res.code === 1004) {
          message.warning('用户不可用')
        } else {
          throw new Error()
        }
      })
      .catch(() => {
        message.error('登录失败')
      })
}
</script>

<style scoped>

</style>