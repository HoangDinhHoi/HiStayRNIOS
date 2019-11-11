// HoiHD
import React, { Fragment } from 'react';
import { 
	View, Text, SafeAreaView
} from 'react-native';
import Index from './src/Index';


const App = () => {
	return (
		<SafeAreaView 
			style={{flex: 1}}>
			<Index/>
		</SafeAreaView>
	)
}
export default App;