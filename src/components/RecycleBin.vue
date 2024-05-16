<template>
  <a-layout-content style="background: #fff; margin: 1rem;">
    <a-table :columns="columns" :data-source="recycleItems" :pagination="false" :scroll="{y: tableHeight}">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'name'">
          <template v-if="record.isFile">
            <span>📄 </span>{{ record.name }}
          </template>
          <template v-else>
            <span>📁 </span>{{ record.name }}
          </template>
        </template>
        <template v-else-if="column.key === 'directoryPath'">
          {{ '/' + record.directoryPath }}
        </template>
        <template v-else-if="column.key === 'action'">
          <a @click="restore(record.id)">还原</a>
          <a-divider type="vertical"/>
          <a @click="deleteForever(record.id)">删除</a>
        </template>
      </template>
    </a-table>
  </a-layout-content>
</template>

<script setup>
import arRequest from '/src/script/auto-refresh-request.js'
import {message} from "ant-design-vue";
import {ref} from "vue";
import dayjs from "dayjs";

const tableHeight = document.body.clientHeight - 300

const columns = [
  {
    title: '文件名',
    dataIndex: 'name',
    key: 'name',
    width: '30%'
  },
  {
    title: '位置',
    dataIndex: 'directoryPath',
    key: 'directoryPath',
    width: '35%'
  },
  {
    title: '删除时间',
    dataIndex: 'expire',
    key: 'expire',
    width: '20%'
  },
  {
    title: '操作',
    key: 'action',
    width: '15%'
  }
];
const recycleItems = ref([])

loadRecycleBin()

function loadRecycleBin() {
  arRequest('/api/file/recycle-bin', {
    method: 'GET'
  }).then(res => {
    if (res.code === 0) {
      return res.data
    } else {
      throw new Error()
    }
  }).then(data => {
    recycleItems.value = data.map(e => ({
      id: e.id,
      name: e.name,
      isFile: e.isFile,
      expire: dayjs(e.deleteTs).format('YYYY/MM/DD HH:mm:ss'),
      directoryPath: e.directoryPath
    }))

  })
}

function restore(id) {
  arRequest(`/api/file/recycle-bin/${id}`, {
    method: 'PUT'
  }).then(res => {
    if (res.code === 0) {
      message.success('还原成功')
    } else if (res.code === 3004) {
      message.warning('目标目录下存在相同名称的项目')
    } else {
      throw new Error()
    }
  }).finally(() => {
    loadRecycleBin()
  })
}

function deleteForever(id) {
  arRequest(`/api/file/recycle-bin/${id}`, {
    method: 'DELETE'
  }).then(res => {
    if (res.code === 0) {
      message.success('删除成功')
    } else {
      throw new Error()
    }
  }).finally(() => {
    loadRecycleBin()
  })
}

</script>

<style scoped>

</style>