<script setup>
import { ref } from 'vue'

const goal = ref('')
const goals = ref(JSON.parse(localStorage.getItem('wmc_goals') || '[]'))
const addGoal = () => {
  if (!goal.value.trim()) return
  goals.value.push({ id: Date.now(), text: goal.value.trim(), done: false })
  localStorage.setItem('wmc_goals', JSON.stringify(goals.value))
  goal.value = ''
}
const toggle = (g) => {
  g.done = !g.done
  localStorage.setItem('wmc_goals', JSON.stringify(goals.value))
}
</script>

<template>
  <div>
    <h2>Tools & Trackers</h2>
    <div class="input-group mb-3">
      <input v-model="goal" class="form-control" placeholder="Add a wellness goal" />
      <button class="btn btn-primary" @click="addGoal">Add</button>
    </div>
    <ul class="list-group">
      <li v-for="g in goals" :key="g.id" class="list-group-item d-flex align-items-center gap-2">
        <input class="form-check-input" type="checkbox" :checked="g.done" @change="toggle(g)" />
        <span :class="{ 'text-decoration-line-through': g.done }">{{ g.text }}</span>
      </li>
    </ul>
  </div>
</template>


