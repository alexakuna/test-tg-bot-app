<template>
  <v-container>
    <v-row justify="center">
      <template>
        <v-data-table
          style="margin-top: 30px"
          :headers="headers"
          :items="users"
          sort-by="calories"
          class="elevation-1"
        >
          <template v-slot:top>
            <v-toolbar
              flat
            >
              <v-toolbar-title>Пользователи</v-toolbar-title>
              <v-divider
                class="mx-4"
                inset
                vertical
              ></v-divider>
              <v-spacer></v-spacer>
              <v-dialog
                v-model="dialog"
                max-width="500px"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    color="primary"
                    class="mx-2"
                    fab
                    dark
                    small
                    v-bind="attrs"
                    v-on="on"
                  >
                    <v-icon>
                      mdi-plus
                    </v-icon>
                  </v-btn>
                </template>
                <v-card>
                  <v-card-title class="justify-space-between">
                    <span class="headline">Форма пользователя</span>
                    <v-btn
                      class="mx-2"
                      fab
                      dark
                      small
                      color="warning"
                      @click="dialog = false"
                    >
                      <v-icon dark>
                        mdi-close
                      </v-icon>
                    </v-btn>
                  </v-card-title>
                  <v-card-text>
                    <v-form
                      ref="form"
                      v-model="valid"
                      lazy-validation
                    >
                      <v-container>
                        <v-row>
                          <v-col cols="12">
                            <v-text-field
                              v-model="editedItem.name"
                              :counter="10"
                              :rules="nameRules"
                              label="Имя*"
                              required
                            ></v-text-field>
                          </v-col>
                          <v-col cols="12">
                            <v-text-field
                              v-model="editedItem.email"
                              :rules="emailRules"
                              label="Email*"
                              required
                            ></v-text-field>
                          </v-col>
                          <v-col cols="12">
                            <v-text-field
                              v-model="editedItem.phone_number"
                              label="Номер телефона*"
                              :rules="phoneRules"
                              v-facade="'+1 (###) ###-####'"
                              placeholder="111 111-1111'"
                              type="text"
                              required
                            ></v-text-field>
                          </v-col>
                          <v-col cols="12">
                            <v-menu
                              ref="menu"
                              v-model="menu"
                              :close-on-content-click="false"
                              transition="scale-transition"
                              offset-y
                              min-width="auto"
                            >
                              <template v-slot:activator="{ on, attrs }">
                                <v-text-field
                                  v-model="editedItem.date_of_birth"
                                  label="Birthday date*"
                                  :rules="dateRules"
                                  prepend-icon="mdi-calendar"
                                  readonly
                                  @blur="date = parseDate(dateFormatted)"
                                  v-bind="attrs"
                                  v-on="on"
                                ></v-text-field>
                              </template>
                              <v-date-picker
                                ref="picker"
                                v-model="date"
                                :max="new Date().toISOString().substr(0, 10)"
                                min="1950-01-01"
                                @change="save"
                              ></v-date-picker>
                            </v-menu>
                          </v-col>
                        </v-row>
                      </v-container>
                    </v-form>

                    <small class="">* помеченны обязательные поля</small>
                  </v-card-text>
                  <v-card-actions style="justify-content: center">
                    <v-spacer></v-spacer>
                    <v-btn
                      block
                      class="ma-2"
                      :loading="loading"
                      :disabled="loading"
                      color="primary"
                      @click="saveUser"
                    >
                      Сохранить
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <v-dialog v-model="dialogDelete" max-width="500px">
                <v-card>
                  <v-card-title class="headline">Удалить пользователя?</v-card-title>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="closeDelete">Отмена</v-btn>
                    <v-btn color="blue darken-1" text @click="deleteItemConfirm">Да</v-btn>
                    <v-spacer></v-spacer>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-toolbar>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-icon
              small
              class="mr-2"
              @click="editItem(item)"
            >
              mdi-pencil
            </v-icon>
            <v-icon
              small
              @click="deleteItem(item)"
            >
              mdi-delete
            </v-icon>
          </template>
          <template v-slot:no-data>
            <v-toolbar-title>Пользователи отсутствуют</v-toolbar-title>
          </template>
        </v-data-table>
      </template>
    </v-row>
  </v-container>
</template>

<script>
import config from "../config";
import axios from 'axios'
  export default {
    name: 'Main',

    data: vm => ({
      dialogDelete: false,
      headers: [
        {
          text: 'Имя пользователя',
          align: 'start',
          sortable: true,
          value: 'name',
        },
        { text: 'День рождения', value: 'date_of_birth' },
        { text: 'Email', value: 'email' },
        { text: 'Номер телефона', value: 'phone_number' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
      users: [],
      editedIndex: -1,
      editedItem: {
        name: '',
        date_of_birth: '',
        email: '',
        phone_number: '',
      },
      defaultItem: {
        name: '',
        date_of_birth: '',
        email: '',
        phone_number: '',
      },
      loader: null,
      loading: false,
      phone: null,
      date: null,
      dateFormatted: vm.formatDate(new Date().toISOString().substr(0, 10)),
      menu: false,
      dialog: false,
      valid: true,
      name: null,
      nameRules: [
        v => !!v || 'Имя обязательно!',
        v => (v && v.length <= 10) || 'Количество символов должно быть меньше 10.',
        v => /^[A-Za-z]+$/.test(v) || 'Только латинские буквы.',
      ],
      email: null,
      emailRules: [
        v => !!v || 'Поле E-mail обязательно!',
        v => /.+@.+\..+/.test(v) || 'Введите валидный E-mail.',
      ],
      phoneRules: [
        v => !!v || 'Введите номер телефона!',
      ],
      dateRules: [
        v => !!v || 'Укажите день дату вашего рождения!',
      ]
    }),
    computed: {
      computedDateFormatted () {
        return this.formatDate(this.date)
      },
      formTitle () {
        return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
      },
    },
    created () {
      this.initialize()

    },
    methods: {
      save (date) {
        this.$refs.menu.save(date)
        this.editedItem.date_of_birth = this.computedDateFormatted
      },
      validate () {
        this.$refs.form.validate()
      },
      reset () {
        this.$refs.form.reset()
      },
      formatDate (date) {
        if (!date) return null

        const [year, month, day] = date.split('-')
        return `${month}/${day}/${year}`
      },
      parseDate (date) {
        if (!date) return null

        const [month, day, year] = date.split('/')
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      },
      editItem (item) {
        this.editedIndex = this.users.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
      },

      deleteItem (item) {
        this.editedIndex = this.users.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialogDelete = true
      },

      deleteItemConfirm () {
        this.users.splice(this.editedIndex, 1)
        axios.post(`${config.BASE_URL}/api/remove`, {email: this.editedItem.email})
        this.closeDelete()
      },

      close () {
        this.dialog = false
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        })
      },

      closeDelete () {
        this.dialogDelete = false
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        })
      },

      async saveUser () {
        if(!this.$refs.form.validate()) {
          return
        }
        this.loader = 'loading'
        if (this.editedIndex > -1) {
          const data = await axios.post(`${config.BASE_URL}/api/update`, this.editedItem)
          Object.assign(this.users[this.editedIndex], data.data)
        } else {
          const data = await axios.post(`${config.BASE_URL}/api/create`, this.editedItem)
          this.users.push(data.data)
        }
        this.close()
      },
      async initialize () {
        const data = await axios.get(`${config.BASE_URL}/api/`)
        this.users = data.data
      },
    },
    watch: {
      dialog (val) {
        val || this.close()
        this.$nextTick(() => {
          this.$refs.form.resetValidation()
        })
      },
      dialogDelete (val) {
        val || this.closeDelete()
      },
      menu (val) {
        val && setTimeout(() => (this.$refs.picker.activePicker = 'YEAR'))
      },
      date () {
        this.dateFormatted = this.formatDate(this.date)
      },
      loader () {
        const l = this.loader
        this[l] = !this[l]

        setTimeout(() => (this[l] = false), 2000)

        this.loader = null
      },
    },
  }
</script>
