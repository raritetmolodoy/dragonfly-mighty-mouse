<template>
  <b-modal
    centered
    @show="beforeShow"
    :title="`${group ? 'Измен' : 'Добавл'}ение группы`"
    id="add-group-modal"
    ref="add-group-modal"
    @hide="resetModal('add-group-modal')"
  >
    <b-form-group label="Название группы">
      <b-input-group>
        <b-input
          :state="inputState($v.newGroupName)"
          v-model.trim="$v.newGroupName.$model"
        />
        <template #append v-if="group">
          <loading-button
            @click="editGroup()"
            :load="loadEdit"
            variant="info"
            :disabled="newGroupName === group.name || $v.newGroupName.$invalid"
          >
            Обновить
          </loading-button>
        </template>
      </b-input-group>
    </b-form-group>

    <template v-if="group">
      <div class="font-weight-bold mb-2">Добавление студентов</div>
      <b-row align-h="between">
        <b-col>
          <b-check
            switch
            :checked="group.joinable"
            @change="toggleGroupJoinable($event)"
            class="text-nowrap"
          >
            Открыта для вступления
          </b-check>
        </b-col>
        <b-col cols="12" md="auto">
          <b-link v-if="group.joinable" @click="copyLink()" class="text-nowrap">
            Пригласить студентов
          </b-link>
          <input type="hidden" id="invite-link" />
        </b-col>
      </b-row>

      <div class="app__separator my-3">или</div>

      <b-collapse
        id="fake-student-collapse"
        @input="resetStudentData()"
        v-model="studentCollapse"
      >
        <div class="mb-3">
          <b-input
            :state="inputState($v.newFakeStudentSurname)"
            v-model.trim="$v.newFakeStudentSurname.$model"
            placeholder="Фамилия"
            class="mb-2"
          />
          <b-input
            :state="inputState($v.newFakeStudentName)"
            v-model.trim="$v.newFakeStudentName.$model"
            placeholder="Имя "
          />
        </div>
      </b-collapse>

      <b-row>
        <b-col>
          <b-button-group
            v-if="!studentCollapse || !studentValid"
            class="w-100"
          >
            <b-btn
              v-if="!studentCollapse || !studentValid"
              variant="info"
              block
              v-b-toggle.fake-student-collapse
            >
              <b-icon v-if="!studentCollapse" icon="plus" />
              {{ !studentCollapse ? 'Добавить вручную' : 'Свернуть' }}
            </b-btn>
            <b-btn id="info-button" variant="outline-info">
              ?
              <b-popover triggers="hover" target="info-button">
                Добавление 'фиктивной' записи студента, который не
                зарегистрировался на сайте. Позднее возможно объединить запись с
                реальным аккаунтом студента.
              </b-popover>
            </b-btn>
          </b-button-group>
          <loading-button
            v-else
            :load="loadFakeStudentAdd"
            @click="addFakeStudent()"
            variant="success"
            block
          >
            Добавить
          </loading-button>
        </b-col>
      </b-row>
    </template>

    <template #modal-footer>
      <confirm-button
        v-if="group"
        @click="deleteGroup()"
        variant="outline-danger"
        class="mr-auto"
        text="Удалить группу"
      />
      <b-btn @click="resetModal('add-group-modal')" variant="light">
        Закрыть
      </b-btn>
      <loading-button
        v-if="!group"
        @click="addGroup()"
        :load="loadAdd"
        variant="success"
        :disabled="$v.newGroupName.$invalid"
      >
        Добавить
      </loading-button>
    </template>
  </b-modal>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import LoadingButton from '@/components/LoadingButton'
import modalMixin from '@/mixins/modal'
import ConfirmButton from '@/components/ConfirmationButton'
import {
  ADD_GROUP,
  UPDATE_GROUP,
  TOGGLE_GROUP_JOINABLE,
  DELETE_GROUP,
  ADD_FAKE_STUDENT_TO_GROUP
} from '@/store/actions.type'

export default {
  components: { LoadingButton, ConfirmButton },

  props: {
    groupId: {
      type: String,
      default: null
    }
  },

  mixins: [
    modalMixin({
      newGroupName: null,
      newFakeStudentName: null,
      newFakeStudentSurname: null,
      studentCollapse: false
    })
  ],

  data: () => ({
    loadAdd: false,
    loadEdit: false,
    loadFakeStudentAdd: false
  }),

  watch: {
    newGroupName() {
      if (this.group && this.newGroupName === this.group.name)
        this.$v.newGroupName.$reset()
    }
  },

  computed: {
    group() {
      return this.groupId
        ? this.$store.state.groups.find(g => g.id === this.groupId)
        : null
    },
    studentValid() {
      return (
        !this.$v.newFakeStudentName.$invalid &&
        !this.$v.newFakeStudentSurname.$invalid
      )
    }
  },

  methods: {
    resetStudentData() {
      this.newFakeStudentName = null
      this.newFakeStudentSurname = null
      this.$v.newFakeStudentName.$reset()
      this.$v.newFakeStudentSurname.$reset()
    },
    async addGroup() {
      this.loadAdd = true
      const newId = await this.$store.dispatch(ADD_GROUP, {
        name: this.newGroupName,
        subjectId: this.$route.params.id
      })
      this.$parent.selectedGroupId = newId
      this.resetModal('add-group-modal')
      this.loadAdd = false
    },
    async editGroup() {
      this.loadEdit = true
      await this.$store.dispatch(UPDATE_GROUP, {
        id: this.group.id,
        name: this.newGroupName
      })
      this.newGroupName = this.group.name
      this.$v.newGroupName.$reset()
      this.loadEdit = false
    },
    toggleGroupJoinable(state) {
      this.$store.dispatch(TOGGLE_GROUP_JOINABLE, { id: this.group.id, state })
    },
    async deleteGroup() {
      this.$parent.selectFirst(true)
      this.resetModal('add-group-modal')
      this.$store.dispatch(DELETE_GROUP, this.group.id)
    },
    beforeShow() {
      if (this.group) {
        this.newGroupName = this.group.name
      }
    },
    async addFakeStudent() {
      this.loadFakeStudentAdd = true
      await this.$store.dispatch(ADD_FAKE_STUDENT_TO_GROUP, {
        name: this.newFakeStudentName,
        surname: this.newFakeStudentSurname,
        groupId: this.groupId
      })
      this.resetStudentData()
      this.loadFakeStudentAdd = false
    },
    copyLink() {
      let a = document.querySelector('#invite-link')
      a.setAttribute('type', 'text')
      a.value = `${location.origin}/join-group/${this.group.id}`
      a.select()
      document.execCommand('copy')
      a.value = ''
      a.setAttribute('type', 'hidden')
      window.getSelection().removeAllRanges()
      this.$store.commit('setToastMsg', {
        msg: 'Ссылка приглашения скопирована!',
        translate: false
      })
    }
  },

  validations: {
    newGroupName: { required },
    newFakeStudentName: { required },
    newFakeStudentSurname: { required }
  }
}
</script>

<style lang="scss" scoped>
.app__separator {
  display: flex;
  color: rgba(0, 0, 0, 0.2);
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 100%;

  &::before,
  &::after {
    content: '';
    flex: 1;
    transform: translateY(2px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  &::before {
    margin-right: 0.2em;
  }

  &::after {
    margin-left: 0.2em;
  }
}
</style>
