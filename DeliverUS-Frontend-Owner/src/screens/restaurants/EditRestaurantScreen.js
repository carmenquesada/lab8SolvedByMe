import React, { useEffect, useState } from 'react'
import { Image, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import * as ExpoImagePicker from 'expo-image-picker'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as yup from 'yup'
import DropDownPicker from 'react-native-dropdown-picker'
import { getRestaurantCategories, getDetail } from '../../api/RestaurantEndpoints'
import InputItem from '../../components/InputItem'
import TextRegular from '../../components/TextRegular'
import * as GlobalStyles from '../../styles/GlobalStyles'
import restaurantLogo from '../../../assets/restaurantLogo.jpeg'
import restaurantBackground from '../../../assets/restaurantBackground.jpeg'
import { showMessage } from 'react-native-flash-message'
import { ErrorMessage, Formik } from 'formik'
import TextError from '../../components/TextError'
import { prepareEntityImages } from '../../api/helpers/FileUploadHelper'
import { buildInitialValues } from '../Helper'

export default function EditRestaurantScreen({ navigation, route }) {
  const [open, setOpen] = useState(false)
  const [restaurantCategories, setRestaurantCategories] = useState([])
  const [backendErrors, setBackendErrors] = useState()
  // 2. Estado para editar el restaurante: guarda los valores que va a usar Formik como initialValues
  const [restaurant, setRestaurant] = useState([])
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
  const validationSchema = yup.object().shape({
    name: yup
      .string()
      .max(255, 'Name too long')
      .required('Name is required'),
    address: yup
      .string()
      .max(255, 'Address too long')
      .required('Address is required'),
    postalCode: yup
      .string()
      .max(255, 'Postal code too long')
      .required('Postal code is required'),
    url: yup
      .string()
      .nullable()
      .url('Please enter a valid url'),
    shippingCosts: yup
      .number()
      .positive('Please provide a valid shipping cost value')
      .required('Shipping costs value is required'),
    email: yup
      .string()
      .nullable()
      .email('Please enter a valid email'),
    phone: yup
      .string()
      .nullable()
      .max(255, 'Phone too long'),
    restaurantCategoryId: yup
      .number()
      .positive()
      .integer()
      .required('Restaurant category is required')
  })

  useEffect(() => {
    async function fetchRestaurantCategories () {
      try {
        const fetchedRestaurantCategories = await getRestaurantCategories()
        const fetchedRestaurantCategoriesReshaped = fetchedRestaurantCategories.map((e) => {
          return {
            label: e.name,
            value: e.id
          }
        })
        setRestaurantCategories(fetchedRestaurantCategoriesReshaped)
      } catch (error) {
        showMessage({
          message: `There was an error while retrieving restaurant categories. ${error} `,
          type: 'error',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      }
    }
    fetchRestaurantCategories()
  }, [])

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ExpoImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!')
        }
      }
    })()
  }, [])

  const pickImage = async (onSuccess) => {
    const result = await ExpoImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1
    })
    if (!result.canceled) {
      if (onSuccess) {
        onSuccess(result)
      }
    }
  }
  // 4. Crear función updateRestaurant:
  const updateRestaurant = async (values) => {
    setBackendErrors([])
    try {
      const updatedRestaurant = await update(restaurant.id, values)
      showMessage({
        message: `Restaurant ${updatedRestaurant.name} succesfully updated`,
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
      navigation.navigate('RestaurantsScreen', { dirty: true })
    } catch (error) {
      console.log(error)
      setBackendErrors(error.errors)
    }
  }
  return (
    <Formik
      enableReinitialize
      validationSchema={validationSchema}
    // 5. Propiedades del Formik:
      initialValues={initialRestaurantValues}
      onSubmit={updateRestaurant}
    >
      {({ handleSubmit, setFieldValue, values }) => (
        <ScrollView>
          <View style={{ alignItems: 'center' }}>
            <View style={{ width: '60%' }}>
              <InputItem
                name='name'
                label='Name:'
              />
              <InputItem
                name='description'
                label='Description:'
              />
              <InputItem
                name='address'
                label='Address:'
              />
              <InputItem
                name='postalCode'
                label='Postal code:'
              />
              <InputItem
                name='url'
                label='Url:'
              />
              <InputItem
                name='shippingCosts'
                label='Shipping costs:'
              />
              <InputItem
                name='email'
                label='Email:'
              />
              <InputItem
                name='phone'
                label='Phone:'
              />

              <DropDownPicker
                open={open}
                value={values.restaurantCategoryId}
                items={restaurantCategories}
                setOpen={setOpen}
                onSelectItem={item => {
                  setFieldValue('restaurantCategoryId', item.value)
                }}
                setItems={setRestaurantCategories}
                placeholder="Select the restaurant category"
                containerStyle={{ height: 40, marginTop: 20 }}
                style={{ backgroundColor: GlobalStyles.brandBackground }}
                dropDownStyle={{ backgroundColor: '#fafafa' }}
              />
              <ErrorMessage name={'restaurantCategoryId'} render={msg => <TextError>{msg}</TextError>} />

              <Pressable onPress={() =>
                pickImage(
                  async result => {
                    await setFieldValue('logo', result)
                  }
                )
              }
                style={styles.imagePicker}
              >
                <TextRegular>Logo: </TextRegular>
                <Image style={styles.image} source={values.logo ? { uri: values.logo.assets[0].uri } : restaurantLogo} />
              </Pressable>

              <Pressable onPress={() =>
                pickImage(
                  async result => {
                    await setFieldValue('heroImage', result)
                  }
                )
              }
                style={styles.imagePicker}
              >
                <TextRegular>Hero image: </TextRegular>
                <Image style={styles.image} source={values.heroImage ? { uri: values.heroImage.assets[0].uri } : restaurantBackground} />
              </Pressable>

              {backendErrors &&
                backendErrors.map((error, index) => <TextError key={index}>{error.param}-{error.msg}</TextError>)
              }

              <Pressable
                onPress={handleSubmit}
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed
                      ? GlobalStyles.brandSuccessTap
                      : GlobalStyles.brandSuccess
                  },
                  styles.button
                ]}>
                <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
                  <MaterialCommunityIcons name='content-save' color={'white'} size={20} />
                  <TextRegular textStyle={styles.text}>
                    Save
                  </TextRegular>
                </View>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      )}
    </Formik>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    height: 40,
    padding: 10,
    width: '100%',
    marginTop: 20,
    marginBottom: 20
  },
  text: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginLeft: 5
  },
  imagePicker: {
    height: 40,
    paddingLeft: 10,
    marginTop: 20,
    marginBottom: 80
  },
  image: {
    width: 100,
    height: 100,
    borderWidth: 1,
    alignSelf: 'center',
    marginTop: 5
  }
})
