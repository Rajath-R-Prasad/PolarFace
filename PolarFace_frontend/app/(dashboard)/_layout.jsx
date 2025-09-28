import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import {Ionicons} from '@expo/vector-icons'

const DashboardLayout = () => {
  return (
   <Tabs>
    <Tabs.Screen name='services' options={{title:'Services',headerShown:true,animation:'fade',tabBarIcon:({focused})=>(
        <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={'black'} />
    )}} />
    <Tabs.Screen name='history' options={{title:'History',headerShown:true,animation:'fade',tabBarIcon:({focused})=>(
        <Ionicons name={focused ? 'time' : 'time-outline'} size={24} color={'black'} />
    )}} />
    <Tabs.Screen name='profile' options={{title:'Profile',headerShown:true,animation:'fade',tabBarIcon:({focused})=>(
        <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={'black'} />
    )}} />
   </Tabs>
  )
}

export default DashboardLayout

const styles = StyleSheet.create({})