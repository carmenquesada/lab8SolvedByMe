import { get, post, put, destroy } from './helpers/ApiRequestsHelper' // 1. Import destroy // 1. Import put

function getAll() {
  return get('users/myrestaurants')
}

function getDetail(id) {
  return get(`restaurants/${id}`)
}

function getRestaurantCategories() {
  return get('restaurantCategories')
}

function create(data) {
  return post('restaurants', data)
}

// 2. Remove function
function remove (id) {
  return destroy(`restaurants/${id}`)
}

// 2. Update function
function update (id, data) {
  return put(`restaurants/${id}`, data)
}
export { getAll, getDetail, getRestaurantCategories, create, remove, update } // 3. Exportar remove // 3. Exportar update
