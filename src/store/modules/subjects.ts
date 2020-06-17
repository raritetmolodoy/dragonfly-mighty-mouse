import { ADD_SUBJECT, UPDATE_SUBJECT, DELETE_SUBJECT } from './actions.type'
import { FIRESTORE } from '@/main'

const state = {}
const mutations = {}
const getters = {}

const actions = {
  async [ADD_SUBJECT]({ rootState }, subj) {
    FIRESTORE.collection('subjects').add({
      name: subj.name,
      course: subj.course,
      teacherId: rootState.user.uid
    })
  },

  async [UPDATE_SUBJECT](_, data) {
    await FIRESTORE.collection('subjects').doc(data.id).update({
      name: data.name,
      course: data.course
    })
  },

  async [DELETE_SUBJECT](_, id) {
    await FIRESTORE.collection('subjects').doc(id).delete()
  }
}

export default { state, getters, mutations, actions }
