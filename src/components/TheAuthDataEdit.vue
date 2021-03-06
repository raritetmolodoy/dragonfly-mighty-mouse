<template>
  <b-card class="shadow-sm border-0">
    <template #header>
      <div class="d-flex justify-content-between align-items-center">
        <div class="font-weight-bold">Данные для входа</div>
        <div>
          <b-form-radio-group
            @change="resetData"
            v-model="selectedRadio"
            buttons
            size="sm"
            :options="options"
            button-variant="light"
          />
        </div>
      </div>
    </template>

    <b-form>
      <b-form-group v-if="selectedRadio === 'email'">
        <template #label>
          <div>
            <label for="email-field" class="m-0 mr-2">Эл. почта</label>
            <b-badge v-if="!emailVerified" variant="danger">
              <b-link
                class="text-white"
                href="/verify-email"
                @click.prevent="verifyEmail"
              >
                Отправить подтверждение
              </b-link>
            </b-badge>
          </div>
        </template>

        <b-form-input
          id="email-field"
          placeholder="Ваша почта"
          :state="inputState($v.newEmail)"
          v-model.trim="$v.newEmail.$model"
        />
      </b-form-group>
      <template v-else>
        <b-form-group label="Новый пароль" label-for="password-field">
          <b-form-input
            id="password-field"
            type="password"
            :state="inputState($v.p.newPassword)"
            v-model.trim="$v.p.newPassword.$model"
          />
          <b-form-invalid-feedback
            v-if="!$v.p.newPassword.minLength"
            v-text="'Пароль не короче 6 символов!'"
          />
        </b-form-group>

        <b-form-group
          label="Подтвердите новый пароль"
          label-for="confirm-field"
        >
          <b-form-input
            id="confirm-field"
            type="password"
            :state="inputState($v.p.confirmPassword)"
            v-model.trim="$v.p.confirmPassword.$model"
          />
          <b-form-invalid-feedback
            v-if="!$v.p.confirmPassword.same"
            v-text="'Пароли должны совпадать!'"
          />
        </b-form-group>
      </template>
    </b-form>

    <template #footer v-if="!isInvalid">
      <b-input-group>
        <b-form-input
          id="old-password-field"
          type="password"
          placeholder="Текущий пароль"
          :state="inputState($v.oldPassword)"
          v-model.trim="$v.oldPassword.$model"
        />
        <template #append>
          <loading-button
            variant="dark"
            block
            :disabled="$v.oldPassword.$invalid"
            @click="updateData"
            :load="loadUpdate"
          >
            Обновить
          </loading-button>
        </template>
      </b-input-group>
    </template>
  </b-card>
</template>

<script>
import { minLength, required, sameAs, email } from 'vuelidate/lib/validators'
import LoadingButton from '@/components/LoadingButton'
import {
  UPDATE_EMAIL,
  UPDATE_PASSWORD,
  VERIFY_EMAIL
} from '@/store/actions.type'

export default {
  components: { LoadingButton },

  data: () => ({
    newEmail: null,
    p: {
      newPassword: null,
      confirmPassword: null
    },
    oldPassword: null,
    selectedRadio: 'email',
    options: [
      { text: 'Эл. почта', value: 'email', selected: true },
      { text: 'Пароль', value: 'password' }
    ],
    loadUpdate: false
  }),

  computed: {
    emailVerified() {
      return this.$store.state.user.emailVerified
    },
    email() {
      return this.$store.state.user.email
    },
    isInvalid() {
      if (this.selectedRadio === 'email')
        return this.$v.newEmail.$invalid || this.newEmail === this.email
      else return this.$v.p.$invalid
    },
    inputState: () => val => (val.$dirty ? !val.$error : null)
  },

  watch: {
    newEmail() {
      if (this.newEmail === this.email) this.$v.newEmail.$reset()
    }
  },

  beforeMount() {
    this.newEmail = this.email
  },

  methods: {
    async updateData() {
      this.loadUpdate = true
      const success =
        this.selectedRadio === 'password'
          ? await this.updatePassword()
          : await this.updateEmail()
      if (!success) this.oldPassword = null
      else this.resetData()
      this.loadUpdate = false
    },
    verifyEmail() {
      this.$store.dispatch(VERIFY_EMAIL)
    },
    updateEmail() {
      return this.$store.dispatch(UPDATE_EMAIL, {
        password: this.oldPassword,
        newEmail: this.newEmail
      })
    },
    updatePassword() {
      return this.$store.dispatch(UPDATE_PASSWORD, {
        old: this.oldPassword,
        new: this.p.newPassword
      })
    },
    resetData() {
      this.newEmail = this.email
      this.p.newPassword = null
      this.p.confirmPassword = null
      this.oldPassword = null
      this.$v.$reset()
    }
  },

  validations: {
    newEmail: { required, email },
    p: {
      newPassword: { required, minLength: minLength(6) },
      confirmPassword: { required, same: sameAs('newPassword') }
    },
    oldPassword: { required, minLength: minLength(6) }
  }
}
</script>
