// useCommonService.js
import axios from 'axios'

export function useCommonService() {
  const request = (config) => {
    return axios(config)
      .then((response) => response.data)
      .catch((error) => {
        console.error(`Error in ${config.method} request to ${config.url}:`, error)
        throw error
      })
  }

  const getAllUsers = () => {
    return request({
      url: '/api/user/getAllUsers',
      method: 'get'
    })
  }

  const getRootFolder = () => {
    return request({
      url: '/api/virtualFolder/root',
      method: 'get'
    })
  }

  const getNewNotifications = () => {
    return request({
      url: '/api/UserNotification/new',
      method: 'get'
    })
  }

  const getAllNotifications = (resource) => {
    const params = {
      Fields: resource.fields,
      OrderBy: resource.orderBy,
      PageSize: resource.pageSize,
      Skip: resource.skip
    }
    return request({
      url: '/api/UserNotification/all',
      method: 'get',
      params
    })
  }

  const getUserNotificationCount = () => {
    return request({
      url: '/api/UserNotification/count',
      method: 'get'
    })
  }

  const markAsReadNotification = (id) => {
    return request({
      url: `/api/UserNotification/${id}`,
      method: 'post'
    })
  }

  const getUsers = (resource) => {
    const params = {
      Fields: resource.fields,
      OrderBy: resource.orderBy,
      FolderId: resource.folderId,
      DocumentId: resource.documentId,
      PageSize: resource.pageSize,
      Skip: resource.skip,
      SearchQuery: resource.searchQuery,
      firstName: resource.first_name,
      lastName: resource.last_name,
      email: resource.email,
      phoneNumber: resource.phone_number,
      physicalFolderId: resource.physicalFolderId,
      type: resource.type,
      isActive: resource.is_active ? '1' : '0'
    }
    return request({
      url: '/User/Shared/Users',
      method: 'get',
      params
    })
  }

  const getDocumentById = (documentId) => {
    return request({
      url: `/api/document/${documentId}`,
      method: 'get'
    })
  }

  const sendNotification = (notification) => {
    return request({
      url: '/api/Folder/notification',
      method: 'post',
      data: notification
    })
  }

  const addRecentActivity = (recentActivity) => {
    return request({
      url: '/api/RecentActivity',
      method: 'post',
      data: recentActivity
    })
  }

  const getRecentActivities = () => {
    return request({
      url: '/api/RecentActivity',
      method: 'get'
    })
  }

  const getPersonFiles = () => {
    return request({
      url: '/api/RecentActivity',
      method: 'get'
    })
  }

  const getListView = () => {
    let listView = localStorage.getItem('listview')
    if (!listView) {
      listView = 'list'
      localStorage.setItem('listview', 'list')
    }
    return listView
  }

  const getFolderDetailById = (id) => {
    return request({
      url: `/api/VirtualFolder/detail/${id}`,
      method: 'get'
    })
  }

  const setListView = (view) => {
    localStorage.setItem('listview', view)
  }

  const isParentChildShared = (id) => {
    return request({
      url: `/api/VirtualFolder/${id}/parentchild/shared`,
      method: 'get'
    })
  }

  const isParentShared = (id) => {
    return request({
      url: `/api/VirtualFolder/${id}/parent/shared`,
      method: 'get'
    })
  }

  const uploadFolderDocument = (form, folderId) => {
    return request({
      url: `/api/api/folder/${folderId}`,
      method: 'post',
      data: form,
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }

  const createChildFoders = (paths, folderId, physicalFolderId) => {
    return request({
      url: `/api/folder/folder/${folderId}`,
      method: 'post',
      data: { paths, physicalFolderId }
    })
  }

  const sendDocumentEmail = (email) => {
    return request({
      url: '/api/Email/SendDocument',
      method: 'post',
      data: email
    })
  }

  const sendFolderEmail = (email) => {
    return request({
      url: '/api/Email/SendFolder',
      method: 'post',
      data: email
    })
  }

  return {
    getAllUsers,
    getRootFolder,
    getNewNotifications,
    getAllNotifications,
    getUserNotificationCount,
    markAsReadNotification,
    getUsers,
    getDocumentById,
    sendNotification,
    addRecentActivity,
    getRecentActivities,
    getPersonFiles,
    getListView,
    getFolderDetailById,
    setListView,
    isParentChildShared,
    isParentShared,
    uploadFolderDocument,
    createChildFoders,
    sendDocumentEmail,
    sendFolderEmail
  }
}
