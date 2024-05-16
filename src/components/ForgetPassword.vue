<template>
  <a-form name="basic"
          :label-col="{ span: 8 }"
          :wrapper-col="{span: 16}"
          style="min-width: 25rem">
    <a-form-item label="邮箱">
      <a-input v-model:value="email" :maxlength="50"/>
    </a-form-item>
    <a-form-item label="验证码">
      <a-input :style="{width: '8rem'}" v-model:value="code" :maxlength="6"/>
      <a-button :style="{marginLeft: '1rem'}"
                type="default" html-type="button"
                :disabled="email === '' || sendCodeTimeWait > 0"
                @click="sendCode">{{ codeButtonText }}
      </a-button>
    </a-form-item>
    <a-form-item label="密码">
      <a-input-password v-model:value="password"
               :status="passwordStatus ? '' : 'error'"
               :maxlength="50"
               @change="checkPassword"/>
    </a-form-item>
    <a-form-item label="确认密码">
      <a-input-password v-model:value="repassword"
               :status="repasswordStatus ? '' : 'error'"
               :maxlength="50"
               @change="repasswordChanged = true; checkRepassword()"/>
    </a-form-item>
    <a-form-item :wrapper-col="{ offset: 8}">
      <RouterLink style="margin-right: 1rem" to="/sign-in">
        <a-button>返回</a-button>
      </RouterLink>
      <a-button type="primary" html-type="button" @click="submit">提交</a-button>
    </a-form-item>
  </a-form>
</template>

<script setup>

import {ref} from "vue";
import {message} from "ant-design-vue";
import router from "../router.js";

const email = ref('')
const code = ref('')
let key = ''

const password = ref('')
const repassword = ref('')

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
  fetch('/api/identity/user/forget-password/email-verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: email.value
    })
  })
      .then(res => res.json())
      .then(res => {
        if (res.code === 0) {
          key = res.data.key
        } else if (res.code === 3007) {
          message.warning('邮箱不存在')
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

const passwordStatus = ref(true)
const checkPassword = () => {
  const reg = /^[A-Za-z0-9_]{4,50}$/
  passwordStatus.value = reg.test(password.value)
  checkRepassword()
}

const repasswordStatus = ref(true)
let repasswordChanged = false
const checkRepassword = () => {
  if (repasswordChanged) {
    repasswordStatus.value = password.value === repassword.value
  }
}

function submit() {
  fetch('/api/identity/user/forget-password/modify', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: email.value,
      key: key,
      code: code.value,
      password: password.value
    })
  }).then(res => res.json())
      .then(res => {
        if (res.code === 0) {
          message.success('修改密码成功')
          router.push('/sign-in')
        } else if (res.code === 3006) {
          message.warning('验证码无效')
        }
      })
}

</script>


<style scoped>

</style>