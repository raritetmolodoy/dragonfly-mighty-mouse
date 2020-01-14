import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

const state = {
  subjects: null
}

const mutations = {
  assignSubjects(s, data) {
    s.subjects = data
  }
}

const getters = {}

const actions = {
  async fetch({ commit, rootState }) {
    let list = await firebase.firestore()
      .collection('subjects')
      .get()
    list = list.docs
      .map(x => ({ ...x.data(), id: x.id }))
      .filter(x => x.teacherId === rootState.user.uid)
    commit('assignSubjects', list)
  },

  async addSubject({ dispatch, rootState }, subj) {
    firebase.firestore()
      .collection('subjects')
      .add({
        name: subj.name,
        course: +subj.course,
        teacherId: rootState.user.uid
      })
    dispatch('fetch')
  }
}


export default { state, getters, mutations, actions }