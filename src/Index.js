// HoiHD
import React, { Component } from 'react';
import { 
    View, Text, TouchableOpacity, ActivityIndicator, Alert, Platform
} from 'react-native';
import WebView from 'react-native-webview';
import AsyncStorage from '@react-native-community/async-storage';
import firebase from 'react-native-firebase';
let URL = "";
class Index extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true, loadingText: "Đang tải dữ liệu...",
			firebase_token: "", uri: "https://app.histay.vn/", method: "", body: ""
		};
	}
	componentDidMount() {
		this.checkPermission();
		this.messageListener();
	}
	// save firebase token to sqlite storage
	setData = async(firebase_token) => {
		try {
			await AsyncStorage.setItem('firebase_token', firebase_token);
		} catch (error) {
			console.log("error about firebase token", error);
		}
	}
	getData = async() => {
		console.log(this.state.firebase_token);
		let op = await AsyncStorage.getItem("firebase_token")
		console.log("op: ", op)
	}
	// Kiem tra dieu de lay ra firebase token, neu khong co quyen thi yeu cau xin cap quyen
	checkPermission = async() => {
		const enabled = await firebase.messaging().hasPermission();
		if (enabled) {
			this.getFcmToken();
		} else {
			this.requestPermission();
		}
	}
	// lay firebase token
	getFcmToken = async() => {
		const firebase_token = await firebase.messaging().getToken();
		let async_firebase_token = await AsyncStorage.getItem('firebase_token');
		if (firebase_token) {
			this.setState({firebase_token});
			if (firebase != async_firebase_token) {
				this.setData(firebase_token);
				this.setState({
					method: "POST", body: "firebase_token=" + firebase_token, loading: false
				})
			} else {
				this.setState({loading: false});
			}
		} else {
			console.log("Error!", "Can not get firebase token from firebase server!");
		}
	}
	// request to get permission of firebase token from server
	requestPermission = async() => {
		try {
			await firebase.messaging().requestPermission();
			this.setState({loading: false});
		} catch (error) {
			console.log(error);
		}
	}
	// listen to message from firebase server
	messageListener = async() => {
		this.notificationListener = firebase.notifications().onNotification((notification) => {
			const {title, body, notificationId, data} = notification;
			if (Object.keys(data).length != 0) {
				URL = data.redirect;
			}
			this.displayNotification(title, body, notificationId);
		});

		this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
			this.setState({loading: true});
			const {data} = notificationOpen.notification;
			if (Object.keys(data).length != 0) {
				this.setState({uri: data.redirect});
			}
			this.setState({uri: URL});
			firebase.notifications().removeDeliveredNotification(notificationOpen.notification.notificationId);
			this.setState({loading: false});
		});

		const notificationOpen = await firebase.notifications().getInitialNotification();
		if (notificationOpen) {
			const {title, body, notificationId, data} = notificationOpen.notification;
			if (Object.keys(data).length != 0) {
				this.setState({uri: data.redirect});
				URL = data.redirect;
			}
			this.displayNotification(title, body, notificationId);
		}

		this.messageListener = firebase.messaging().onMessage((message) => {
			console.log(JSON.stringify(message));
		})
	}
	// display notification
	displayNotification = (title, body, notificationId) => {
		const notificationShow = new firebase.notifications.Notification().setNotificationId(notificationId).setTitle(title).setBody(body);
		firebase.notifications().displayNotification(notificationShow);
	}
	render() {
		let {loading, loadingText} = this.state;
		if (this.state.loading) {
			return (
				<View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
					<Text style={{fontFamily: 'Arial', fontSize: 18}}>Đang tải dữ liệu...</Text>
					<View style={{height: 5}}/>
					<ActivityIndicator animating size="large"/>
				</View>
			)
		}
		return (
			<View style={{flex: 1}}>
				<WebView
					renderError={()=> Alert.alert(
						"Connection Error!",
						"Please check again network connection. \nOr contact with administrator to resolve this problem.",
						[
							{"text": "Reload page", onPress: ()=>{this.refWebView.reload()}},
						],
						{cancelable: false}
					)}
					ref={ref=>this.refWebView=ref}
					source={{
						uri: this.state.uri,
						method: this.state.method,
						body: this.state.body
					}}
				/>
			</View>
		);
	}
}

export default Index;