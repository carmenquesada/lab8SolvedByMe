/* eslint-disable react/prop-types */
import React, { useContext, useEffect, useState } from 'react'
import { StyleSheet, FlatList, Pressable, View } from 'react-native'

import { getAll, remove } from '../../api/RestaurantEndpoints'
import ImageCard from '../../components/ImageCard'
import TextSemiBold from '../../components/TextSemibold'
import TextRegular from '../../components/TextRegular'
import { MaterialCommunityIcons } from '@expo/vector-icons' // 1. Importar esto
import * as GlobalStyles from '../../styles/GlobalStyles'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import { showMessage } from 'react-native-flash-message'
import DeleteModal from '../../components/DeleteModal'
import restaurantLogo from '../../../assets/restaurantLogo.jpeg'
import { API_BASE_URL } from '@env'

// Action buttons for editing and removing restaurants:
export default function RestaurantsScreen({ navigation, route }) {
  const [restaurants, setRestaurants] = useState([])
  const { loggedInUser } = useContext(AuthorizationContext)
  // 1. Estado para almacenar el restaurante que sería eliminado si se pulsa el botón 'eliminar':
  const [restaurantToBeDeleted, setRestaurantToBeDeleted] = useState(null)
  // 2. Estado para editar el restaurante: guarda los valores que va a usar Formik como initialValues
  const [initialRestaurantValues, setInitialRestaurantValues] = useState({ name: null, description: null, address: null, postalCode: null, url: null, shippingCosts: null, email: null, phone: null, restaurantCategoryId: null, logo: null, heroImage: null })
  // 3. useEffect para cargar los datos:
  useEffect(() => {
    async function fetchRestaurantDetail () {
      try {
        const fetchedRestaurant = await getDetail(route.params.id) // llama a getDetail para traer los datos
        const preparedRestaurant = prepareEntityImages(fetchedRestaurant, ['logo', 'heroImage']) // Adaptar los datos de imagen
        setRestaurant(preparedRestaurant) // Guardar restaurante en el estado
        const initialValues = buildInitialValues(preparedRestaurant, initialRestaurantValues) // Crea valores iniciales para el formulario
        setInitialRestaurantValues(initialValues) // Set los initial values en Formik
      } catch (error) { // Manejo de errores
        showMessage({
          message: `There was an error while retrieving restaurant details (id ${route.params.id}). ${error}`,
          type: 'error',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      }
    }
    fetchRestaurantDetail()
  }, [route])
  useEffect(() => {
    if (loggedInUser) {
      fetchRestaurants()
    } else {
      setRestaurants(null)
    }
  }, [loggedInUser, route])

  const renderRestaurant = ({ item }) => {
    return (
      <ImageCard
        imageUri={item.logo ? { uri: API_BASE_URL + '/' + item.logo } : restaurantLogo}
        title={item.name}
        onPress={() => {
          navigation.navigate('RestaurantDetailScreen', { id: item.id })
        }}
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        {item.averageServiceMinutes !== null &&
          <TextSemiBold>Avg. service time: <TextSemiBold textStyle={{ color: GlobalStyles.brandPrimary }}>{item.averageServiceMinutes} min.</TextSemiBold></TextSemiBold>
        }
        <TextSemiBold>Shipping: <TextSemiBold textStyle={{ color: GlobalStyles.brandPrimary }}>{item.shippingCosts.toFixed(2)}€</TextSemiBold></TextSemiBold>
        <View style={styles.actionButtonsContainer}>
          <Pressable // 2. Añadir pressable para Edit y Delete
  // 1. Reemplazar en el onPress: al pulsar edit se navega a EditRestaurantScreen, enviando el id del Restaurante a editar
  onPress={() => navigation.navigate('EditRestaurantScreen', { id: item.id })}
  style={({ pressed }) => [
    {
      backgroundColor: pressed
        ? GlobalStyles.brandBlueTap
        : GlobalStyles.brandBlue
    },
    styles.actionButton
  ]}>
  <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
    <MaterialCommunityIcons name='pencil' color={'white'} size={20}/>
    <TextRegular textStyle={styles.text}>
      Edit
    </TextRegular>
  </View>
</Pressable>
<Pressable // 2. Reemplazar en el onPress para que cuando se pulse el estado restaurantToBeDeleted se active:
  onPress={() => setRestaurantToBeDeleted(item)}
  style={({ pressed }) => [
    {
      backgroundColor: pressed
        ? GlobalStyles.brandPrimaryTap
        : GlobalStyles.brandPrimary
    },
    styles.actionButton
  ]}>
  <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
    <MaterialCommunityIcons name='delete' color={'white'} size={20}/>
    <TextRegular textStyle={styles.text}>
      Delete
    </TextRegular>
  </View>
</Pressable>
        </View>
      </ImageCard>
    )
  }

  const renderEmptyRestaurantsList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        No restaurants were retreived. Are you logged in?
      </TextRegular>
    )
  }

  const renderHeader = () => {
    return (
      <>
        {loggedInUser &&
          <Pressable
            onPress={() => navigation.navigate('CreateRestaurantScreen')
            }
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? GlobalStyles.brandGreenTap
                  : GlobalStyles.brandGreen
              },
              styles.button
            ]}>
            <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
              <MaterialCommunityIcons name='plus-circle' color={'white'} size={20} />
              <TextRegular textStyle={styles.text}>
                Create restaurant
              </TextRegular>
            </View>
          </Pressable>
        }
      </>
    )
  }
  const fetchRestaurants = async () => {
    try {
      const fetchedRestaurants = await getAll()
      setRestaurants(fetchedRestaurants)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving restaurants. ${error} `,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }
  // 4. Crear función: removeRestaurant
  const removeRestaurant = async (restaurant) => {
    try {
      await remove(restaurant.id)
      await fetchRestaurants()
      setRestaurantToBeDeleted(null)
      showMessage({
        message: `Restaurant ${restaurant.name} succesfully removed`,
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    } catch (error) {
      console.log(error)
      setRestaurantToBeDeleted(null)
      showMessage({
        message: `Restaurant ${restaurant.name} could not be removed.`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }
  return (
    <>
      <DeleteModal // 3. Añadir el componente DeleteModel: pide confirmación al usuario antes de eliminar el restaurante
        isVisible={restaurantToBeDeleted !== null} // solo cuando hay un restaurante pendiente de borrar
        onCancel={() => setRestaurantToBeDeleted(null)} // si se pulsa cancelar, no se borra. Si se pulsa confirmar, se borra
        onConfirm={() => removeRestaurant(restaurantToBeDeleted)}>  
        <TextRegular>The products of this restaurant will be deleted as well</TextRegular>
        <TextRegular>If the restaurant has orders, it cannot be deleted.</TextRegular>
      </DeleteModal>
      <FlatList
        style={styles.container}
        data={restaurants}
        renderItem={renderRestaurant}
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyRestaurantsList}
      />

    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  button: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    width: '80%'
  },
  actionButton: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    margin: '1%',
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'column',
    width: '50%'
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    bottom: 5,
    position: 'absolute',
    width: '90%'
  },
  text: {
    fontSize: 16,
    color: 'white',
    alignSelf: 'center',
    marginLeft: 5
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  }
})
