<template>
  <main>
    <b-container>
      <b-card class="shadow-sm border-0 mb-4">
        <b-row align-h="between" align-v="center">
          <b-col sm="auto">
            <h1 class="mb-0" v-mobile-class="'text-center mb-3'">
              Мои дисциплины
            </h1>
          </b-col>
          <b-col cols="12" sm="auto">
            <b-btn
              block
              variant="success"
              v-if="isTeacher"
              v-b-modal.modal-subject
            >
              Добавить дисциплину
            </b-btn>
          </b-col>
        </b-row>
      </b-card>

      <b-row class="mb-3">
        <b-col sm="12" md="7" lg="8">
          <b-table
            :fields="tableHeaders"
            :items="subjectsByCourse"
            :filter="filter"
            sort-by="course"
            show-empty
            hover
            thead-class="border-bottom"
            borderless
            class="g__pointer bg-white shadow-sm rounded"
            @row-clicked.once="$router.push(`subjects/${$event.id}`)"
          >
            <template #empty>
              <div class="text-center text-muted">Список дисциплин пуст</div>
            </template>
            <template #emptyfiltered>
              <div class="text-center text-muted">
                По запросу ничего не найдено
              </div>
            </template>
            <template #cell(name)="data">
              <text-highlight
                highlight-class="bg-info text-white"
                v-if="filter"
                :queries="filter"
              >
                {{ data.item.name }}
              </text-highlight>
              <template v-else>{{ data.item.name }}</template>
            </template>
          </b-table>
        </b-col>

        <b-col sm="12" md="5" lg="4">
          <b-card
            class="border-0 shadow-sm mb-3"
            v-if="subjects && coursesList.length > 1"
          >
            <div class="mb-2 font-weight-bold">Курс обучения</div>
            <b-nav pills>
              <b-nav-item
                to="/subjects"
                link-classes="app__link"
                exact-active-class="app__link_active"
              >
                Все
              </b-nav-item>
              <b-nav-item
                v-for="(c, i) in coursesList"
                :key="i"
                :to="`?course=${c}`"
                link-classes="app__link"
                exact-active-class="app__link_active"
              >
                {{ c }}
              </b-nav-item>
            </b-nav>
          </b-card>

          <b-card
            v-if="isTeacher || (subjects && subjects.length)"
            class="border-0 shadow-sm"
          >
            <div v-if="subjects && subjects.length">
              <b-input-group>
                <b-input-group-prepend is-text>
                  <b-icon icon="search" />
                </b-input-group-prepend>
                <b-input
                  type="search"
                  v-model.trim="filter"
                  placeholder="Поиск по названию"
                />
              </b-input-group>
            </div>
          </b-card>
        </b-col>
      </b-row>
    </b-container>

    <!-- invisible -->
    <subject-modal
      id="modal-subject"
      ref="modal-subject"
      ok-variant="success"
      cancel-variant="light"
      title="Добавление дисциплины"
      ok-title="Добавить"
      cancel-title="Отмена"
    />
    <!-- /invisible -->
  </main>
</template>

<script>
import SubjectModal from '@/components/SubjectModal'
import TextHighlight from 'vue-text-highlight'

export default {
  components: { TextHighlight, SubjectModal },

  data: () => ({
    filter: null,
    tableHeaders: [
      { key: 'name', label: 'Название', sortable: true },
      { key: 'course', label: 'Курс', sortable: true }
    ]
  }),

  computed: {
    subjects() {
      return this.$store.state.subjects
    },
    subjectsByCourse() {
      if (this.subjects) {
        if (this.$route.query.course) {
          let ar = [...this.subjects]
          ar = ar.filter(x => x.course === +this.$route.query.course)
          return ar
        }
        return this.subjects
      } else return []
    },
    coursesList() {
      return this.subjects
        ? [...new Set(this.subjects.map(x => x.course).sort())]
        : []
    },
    isTeacher() {
      return this.$store.state.user.isTeacher
    }
  }
}
</script>

<style lang="scss" scoped>
.app__link_active {
  background: $dark !important;
  transition: background-color 0.17s ease-in-out;
  color: white !important;
}

.app__link {
  color: black;
  transition: background-color 0.17s ease-in-out;

  &:hover {
    background-color: darken($light, 3);
  }
}
</style>
