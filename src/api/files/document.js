import request from '@/utils/request'

/**
 * 文件夹存储分页查询
 * @param {查询条件} data
 */
export function listFolder(id) {
  return request({
    url: '/api/VirtualFolder/' + id,
    method: 'get'
  })
}

/**
 * 文件存储分页查询
 * @param {查询条件} data
 */
export function listSysfile(id) {
  return request({
    url: '/api/Document/folder/' + id,
    method: 'get'
  })
}

export const getAllInfo = {
  //查询基础信息
  getFolderList: (id) =>
    request({
      url: '/api/VirtualFolder/' + id,
      method: 'get'
    }),
  //查询字典
  getDocumentList: (id) =>
    request({
      url: '/api/Document/folder/' + id,
      method: 'get'
    })
}

/**
 * 新增文件存储
 * @param data
 */
export function addDocument(folderId, data) {
  return request({
    url: `/api/folder/${folderId}`,
    method: 'post',
    data: data,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export function getDocumentToken(id, isVersion = false) {
  return request({
    url: `/api/document/${id}/token?isVersion=${isVersion}`,
    method: 'get',
    headers: { Accept: 'application/json' }
  })
}

// 复制文件
export function copyDocument(data) {
  return request({
    url: `/api/Document/copy`,
    method: 'post',
    data: data
  })
}

// 复制文件
export function moveDocument(data) {
  return request({
    url: `/api/Document/move`,
    method: 'post',
    data: data
  })
}

/**
 * 修改文件存储
 * @param data
 */
export function updateSysfile(data) {
  return request({
    url: 'tool/file',
    method: 'PUT',
    data: data
  })
}

/**
 * 获取文件存储详情
 * @param {Id}
 */
export function getSysfile(id) {
  return request({
    url: 'tool/file/' + id,
    method: 'get'
  })
}

/**
 * 删除文件存储
 * @param {主键} pid
 */
export function delSysfile(pid) {
  return request({
    url: 'tool/file/' + pid,
    method: 'delete'
  })
}

// 导出文件存储
export function exportSysfile(query) {
  return request({
    url: 'tool/file/export',
    method: 'get',
    params: query
  })
}
