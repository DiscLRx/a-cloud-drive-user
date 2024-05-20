<template>
  <a-form :model="form"
          name="basic"
          :label-col="{ span: 8 }"
          :wrapper-col="{span: 8}"
          :style="{width:'100%'}">
    <a-form-item label="用户名">
      <a-input v-model:value="form.username"
               placeholder="4-50位字母、数字或下划线"
               :maxlength="50"
               :status="usernameStatus ? '' : 'error'"
               @change="checkUsername"/>
    </a-form-item>
    <a-form-item label="密码">
      <a-input-password v-model:value="form.password"
                        placeholder="4-50位字母、数字或下划线"
                        :maxlength="50"
                        :status="passwordStatus ? '' : 'error'"
                        @change="checkPassword"/>
    </a-form-item>
    <a-form-item label="确认密码">
      <a-input-password v-model:value="form.repassword"
                        placeholder="再次输入密码"
                        :maxlength="50"
                        :status="repasswordStatus ? '' : 'error'"
                        @change="repasswordChanged = true; checkRepassword();"/>
    </a-form-item>
    <a-form-item label="邮箱">
      <a-input v-model:value="form.email"
               :maxlength="50"
               :status="emailStatus ? '' : 'error'"
               @change="checkEmail"/>
    </a-form-item>
    <a-form-item label="验证码">
      <a-input :style="{width: '6rem'}" v-model:value="form.code" :maxlength="6"/>
      <a-button :style="{marginLeft: '1rem'}"
                type="default" html-type="button"
                :disabled="form.email === '' || !emailStatus || sendCodeTimeWait > 0"
                @click="sendCode">{{ codeButtonText }}
      </a-button>
    </a-form-item>
    <a-form-item label="昵称">
      <a-input v-model:value="form.displayName"
               placeholder="选填"
               :maxlength="50"
               :status="displayNameStatus ? '' : 'error'"
               @change="checkDisplayName"/>
    </a-form-item>
    <a-form-item :wrapper-col="{ offset: 8}">
      <a-button type="primary" html-type="button"
                :disabled="!(
                    (usernameStatus && form.username !== '')
                    && (passwordStatus && form.password !== '')
                    && (repasswordStatus  && form.repassword !== '')
                    && (emailStatus  && form.email !== '')
                    && displayNameStatus
                    && form.code.length === 6
                )"
                @click="signUp">注册
      </a-button>
    </a-form-item>
  </a-form>
</template>

<script setup>
import {reactive, ref} from 'vue';
import router from "/src/router.js";
import {message} from "ant-design-vue";

const form = reactive({
  username: '',
  password: '',
  repassword: '',
  displayName: '',
  email: '',
  key: '',
  code: ''
})

const emailStatus = ref(true)
const checkEmail = () => {
  const reg = /^[\w\-\\.]+@([\w-]+\.)+[\w-]{2,}$/
  emailStatus.value = reg.test(form.email)
}

const codeButtonText = ref('获取验证码')

const sendCodeTimeWait = ref(0)

const setCodeTimeWait = () => {
  sendCodeTimeWait.value = 30
  codeButtonText.value = sendCodeTimeWait.value.toString()
  const interval = setInterval(() => {
    sendCodeTimeWait.value--
    codeButtonText.value = sendCodeTimeWait.value.toString()
    if (sendCodeTimeWait.value <= 0) {
      clearInterval(interval)
      codeButtonText.value = '获取验证码'
    }
  }, 1000)
}

const sendCode = () => {
  fetch('/api/identity/user/sign-up/email-verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: form.email
    })
  })
      .then(res => res.json())
      .then(res => {
        const code = res.code
        if (code === 0) {
          form.key = res.data.key
        } else if (code === 3002) {
          message.warning('邮箱已存在')
          sendCodeTimeWait.value = 0
        } else {
          throw new Error()
        }
      })
      .catch(() => {
        message.error('获取验证码失败')
        sendCodeTimeWait.value = 0
      })
  setCodeTimeWait()
}

const usernameStatus = ref(true)
const checkUsername = () => {
  const reg = /^[A-Za-z0-9_]{4,50}$/
  usernameStatus.value = reg.test(form.username)
}

const passwordStatus = ref(true)
const checkPassword = () => {
  const reg = /^[A-Za-z0-9_]{4,50}$/
  passwordStatus.value = reg.test(form.password)
  checkRepassword()
}

const repasswordStatus = ref(true)
let repasswordChanged = false
const checkRepassword = () => {
  if (repasswordChanged) {
    repasswordStatus.value = form.password === form.repassword
  }
}

const displayNameStatus = ref(true)
const checkDisplayName = () => {
  displayNameStatus.value = form.displayName.length <= 50
}

const signUp = () => {
  fetch('/api/identity/user/sign-up', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(form)
  })
      .then(res => res.json())
      .then(res => {
        const code = res.code
        if (code === 0) {
          message.success('注册成功')
          router.push('/sign-in')
        } else if (code === 3001) {
          message.warning('用户名已存在')
        } else if (res.code === 3006) {
          message.warning('无效的验证码')
        } else {
          throw new Error()
        }
      })
      .catch(() => {
        message.error('注册失败')
      })
}
</script>

<style scoped>

</style>