<script setup>
import { ref, computed } from 'vue'

const goal = ref('')
const goals = ref(JSON.parse(localStorage.getItem('wmc_goals') || '[]'))
const selectedCategory = ref('All')

const categories = ['All', 'Fitness', 'Nutrition', 'Mental Health', 'Lifestyle']

const filteredGoals = computed(() => {
  if (selectedCategory.value === 'All') return goals.value
  return goals.value.filter(g => g.category === selectedCategory.value)
})

const completedGoals = computed(() => {
  return goals.value.filter(g => g.done).length
})

const totalGoals = computed(() => {
  return goals.value.length
})

const progressPercentage = computed(() => {
  if (totalGoals.value === 0) return 0
  return Math.round((completedGoals.value / totalGoals.value) * 100)
})

const addGoal = () => {
  if (!goal.value.trim()) return
  
  const newGoal = {
    id: Date.now(),
    text: goal.value.trim(),
    done: false,
    category: 'Lifestyle',
    createdAt: new Date().toISOString(),
    completedAt: null
  }
  
  goals.value.push(newGoal)
  localStorage.setItem('wmc_goals', JSON.stringify(goals.value))
  goal.value = ''
}

const toggle = (g) => {
  g.done = !g.done
  g.completedAt = g.done ? new Date().toISOString() : null
  localStorage.setItem('wmc_goals', JSON.stringify(goals.value))
}

const deleteGoal = (goalId) => {
  goals.value = goals.value.filter(g => g.id !== goalId)
  localStorage.setItem('wmc_goals', JSON.stringify(goals.value))
}

const clearCompleted = () => {
  goals.value = goals.value.filter(g => !g.done)
  localStorage.setItem('wmc_goals', JSON.stringify(goals.value))
}
</script>

<template>
  <div>
    <div class="d-flex align-items-end justify-content-between mb-4">
      <div>
        <h2 class="mb-0">Tools & Trackers</h2>
        <small class="text-muted">Track your wellness goals and monitor your progress</small>
      </div>
    </div>

    <!-- Progress Overview -->
    <div class="row g-4 mb-4">
      <div class="col-md-6">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h5 class="card-title d-flex align-items-center">
              <i class="bi bi-target me-2 text-primary"></i>Progress Overview
            </h5>
            <div class="d-flex align-items-center mb-3">
              <div class="flex-grow-1 me-3">
                <div class="progress" style="height: 8px;">
                  <div 
                    class="progress-bar bg-primary" 
                    :style="{ width: progressPercentage + '%' }"
                  ></div>
                </div>
              </div>
              <span class="fw-bold text-primary">{{ progressPercentage }}%</span>
            </div>
            <div class="row text-center">
              <div class="col-6">
                <h4 class="fw-bold text-success mb-1">{{ completedGoals }}</h4>
                <small class="text-muted">Completed</small>
              </div>
              <div class="col-6">
                <h4 class="fw-bold text-primary mb-1">{{ totalGoals }}</h4>
                <small class="text-muted">Total Goals</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-6">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h5 class="card-title d-flex align-items-center">
              <i class="bi bi-lightning me-2 text-warning"></i>Quick Actions
            </h5>
            <div class="d-grid gap-2">
              <button @click="clearCompleted" class="btn btn-outline-secondary btn-sm">
                <i class="bi bi-trash me-1"></i>Clear Completed
              </button>
              <RouterLink to="/resources" class="btn btn-outline-primary btn-sm">
                <i class="bi bi-journal-text me-1"></i>Browse Resources
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add New Goal -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <h5 class="card-title mb-3">Add New Goal</h5>
        <div class="row g-3">
          <div class="col-md-8">
            <input 
              v-model="goal" 
              @keyup.enter="addGoal"
              class="form-control" 
              placeholder="What's your next wellness goal?" 
            />
          </div>
          <div class="col-md-4">
            <button @click="addGoal" class="btn btn-primary w-100">
              <i class="bi bi-plus-circle me-1"></i>Add Goal
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Goals List -->
    <div class="card border-0 shadow-sm">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="card-title mb-0">Your Goals</h5>
          <select v-model="selectedCategory" class="form-select form-select-sm" style="width: auto;">
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>

        <div v-if="filteredGoals.length === 0" class="text-center py-5">
          <div class="display-4 mb-3">🎯</div>
          <h5>No goals yet</h5>
          <p class="text-muted">Start by adding your first wellness goal above</p>
        </div>

        <div v-else class="list-group list-group-flush">
          <div 
            v-for="g in filteredGoals" 
            :key="g.id" 
            class="list-group-item d-flex align-items-center gap-3 border-0 px-0"
          >
            <div class="form-check">
              <input 
                class="form-check-input" 
                type="checkbox" 
                :checked="g.done" 
                @change="toggle(g)"
                :id="'goal-' + g.id"
              />
            </div>
            <div class="flex-grow-1">
              <span 
                :class="{ 
                  'text-decoration-line-through text-muted': g.done,
                  'fw-medium': !g.done
                }"
              >
                {{ g.text }}
              </span>
              <div class="d-flex align-items-center gap-2 mt-1">
                <span class="badge bg-light text-dark">{{ g.category }}</span>
                <small class="text-muted">
                  {{ new Date(g.createdAt).toLocaleDateString() }}
                </small>
                <small v-if="g.completedAt" class="text-success">
                  ✓ Completed {{ new Date(g.completedAt).toLocaleDateString() }}
                </small>
              </div>
            </div>
            <button 
              @click="deleteGoal(g.id)"
              class="btn btn-outline-danger btn-sm"
              title="Delete goal"
            >
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-group-item:hover {
  background-color: rgba(37, 99, 235, 0.02);
}

.progress {
  border-radius: 10px;
}

.progress-bar {
  border-radius: 10px;
  transition: width 0.6s ease;
}
</style>


