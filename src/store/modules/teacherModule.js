import firebase from 'firebase/app'
import { db, storage } from '../../main'
import { firestoreAction } from 'vuexfire'

const state = {
  subjects: null,
  groups: null,
  tasks: null
}

const mutations = {}
const getters = {}

const actions = {
  bindSubjects: firestoreAction(async ({ bindFirestoreRef, rootState }) => {
    if (rootState.user.isTeacher)
      bindFirestoreRef(
        'subjects',
        db.collection('subjects').where('teacherId', '==', rootState.user.uid))
    else {
      let groupsWhereStudentPresented = await db.collection('groups')
        .where('students', 'array-contains', rootState.user.uid).get()
      let subjectIdList = groupsWhereStudentPresented.docs.map(c => c.data().subjectId)
      await bindFirestoreRef(
        'subjects',
        db.collection('subjects')
          .where(firebase.firestore.FieldPath.documentId(), 'in', subjectIdList)
      )
    }
  }),

  bindGroup: firestoreAction(({ bindFirestoreRef }, subjectId) =>
    bindFirestoreRef(
      'groups',
      db.collection('groups').where('subjectId', '==', subjectId))
  ),

  bindTasks: firestoreAction(({ bindFirestoreRef, rootState }, subjectId) => {
    if (rootState.user.isTeacher)
      bindFirestoreRef(
        'tasks',
        db.collection('tasks').where('subjectId', '==', subjectId))
    else {
      bindFirestoreRef(
        'tasks',
        db.collection('tasks')
          .where('subjectId', '==', subjectId)
          .where('visible', '==', true))
    }
  }
  ),

  async addSubject({ rootState }, subj) {
    db.collection('subjects').add({
      name: subj.name,
      course: +subj.course,
      teacherId: rootState.user.uid
    })
  },

  async updateSubject(_, data) {
    await db.collection('subjects').doc(data.id).update({
      name: data.name,
      course: data.course
    })
  },

  async deleteSubject({ commit }, id) {
    commit('setLoading', 'deleteSubjectBtn')
    await db.collection('subjects').doc(id).delete()
    commit('unsetLoading')
  },

  async uploadFiles(_, files) {
    let pinnedFiles = []
    for (let file of files) {
      let ref = storage.ref(`lab_files/${Math.random().toString(7)}/${file.name}`)
      await ref.put(file)
      let link = await ref.getDownloadURL()
      pinnedFiles.push({ name: file.name, link, path: ref.fullPath, size: file.size })
    }
    return pinnedFiles
  },

  async addTask({ commit, dispatch }, newTask) {
    commit('setLoading', 'btn-addLab')
    const pinnedFiles = await dispatch('uploadFiles', newTask.files)
    await db.collection('tasks').add({
      name: newTask.name,
      number: newTask.number,
      description: newTask.description,
      score: newTask.score,
      files: pinnedFiles,
      visible: newTask.visible,
      subjectId: newTask.subjectId
    })
    commit('unsetLoading')
  },

  async editTask({ commit, dispatch }, task) {
    commit('setLoading', 'btn-addLab')
    const pinnedFiles = await dispatch('uploadFiles', task.files)
    await db.collection('tasks').doc(task.id).update({
      name: task.name,
      number: task.number,
      description: task.description,
      score: task.score,
      files: pinnedFiles,
      visible: task.visible
    })
    commit('unsetLoading')
  },

  toggleTaskVisibility(_, data) {
    db.collection('tasks').doc(data.id).update({
      visible: data.state
    })
  },

  async deleteTask(_, id) {
    await db.collection('tasks').doc(id).delete()
  },

  async addGroup(_, groupData) {
    await db.collection('groups').add({
      name: groupData.name,
      subjectId: groupData.subjectId
    })
  }
}

export default { state, getters, mutations, actions }