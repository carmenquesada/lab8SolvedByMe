import { get, post, put, destroy } from './helpers/ApiRequestsHelper' // 1. Import destroy

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
export { getAll, getDetail, getRestaurantCategories, create, remove } // 3. Exportar remove
