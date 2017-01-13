/**
 * 交友模块中的地图
 * @author keyy/1501718947@qq.com 16/12/21 15:06
 * @description
 */
import React, {Component} from 'react'
import {
  View,
  StyleSheet,
  Text,
  StatusBar,
  Platform,
  InteractionManager,
  Dimensions,
  TouchableHighlight
} from 'react-native'
import BaseComponent from '../base/BaseComponent'
import MapView from 'react-native-maps'
import Spinner from '../components/Spinner'
import {calculateRegion} from '../utils/MapHelpers'
import MapCallout from '../components/MapCallout'
import {toastShort} from '../utils/ToastUtil'
import * as VicinityActions from '../actions/Vicinity'
import {connect} from 'react-redux'
import {URL_DEV} from '../constants/Constant'
import UserInfo from '../pages/UserInfo'
import * as HomeActions from '../actions/Home'
import tmpGlobal from '../utils/TmpVairables'

const {height, width} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  gpsTips: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    ...Platform.select({
      ios: {
        top: 12,
        left: 60,
        right: 60,
        height: 38,
      },
      android: {
        top: 12,
        left: 60,
        right: 60,
        height: 38,
      }
    }),
    backgroundColor: 'rgba(255,255,0,0.7)'
  },
  tipsContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tipsText: {
    fontSize: 12,
    textAlign: 'center',
    flex: 1,
  },
  map: {
    position: 'absolute',
    width: width,
    ...Platform.select({
      ios: {
        height: height - 64
      },
      android: {
        height: height - 54
      }
    })
  },
});

let watchId;
let compareRegion = {
  ne_lat: 0,
  ne_long: 0,
  sw_lat: 0,
  sw_long: 0
};
let compareCenterRegion = {
  longitude: 0,
  longitudeDelta: 0,
  latitude: 0,
  latitudeDelta: 0
};
let searchTimes = 0;
let pageNavigator;
let hasMove = false;
let myLocation = {};

class Map extends BaseComponent {

  constructor(props) {
    super(props);
    this.state = {
      pending: false,
      initialPosition: 'unknown',
      lastPosition: 'unknown',
      GPS: true,
      tipsText: '请在设置中打开高精确度定位,以便查看附近的人',
      refresh: false,
      locations: []
    };
    pageNavigator = this.props.navigator;
    this.renderMapMarkers = this.renderMapMarkers.bind(this);
  }

  componentWillMount() {
    InteractionManager.runAfterInteractions(() => {
      this.getPosition();
    });
  }

  getPosition() {
    console.log('定位开始');
    this.setState({pending: true});
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log(position);
        this._positionSuccessHandler(position);
      },
      (error) => {
        console.log(error);
        this._positionErrorHandler(error);
      },
      {enableHighAccuracy: false, timeout: 5000, maximumAge: 5000}
    );
    watchId = navigator.geolocation.watchPosition((position) => {
        console.log(position);
        //防止进入地图时,使用默认区域搜索,这里将搜索开关设为1,搜索区域发生变化后,即可搜索
        searchTimes = 1;
        this._positionSuccessHandler(position);
        navigator.geolocation.clearWatch(watchId);
      }, (error) => {
        console.log(error);
        this._positionErrorHandler(error);
      },
      {enableHighAccuracy: false, timeout: 5000, maximumAge: 5000});
  }

  _positionSuccessHandler(position) {
    tmpGlobal.currentLocation = {
      Lat: position.coords.latitude,
      Lng: position.coords.longitude
    };
    this._initRegion(position.coords.latitude, position.coords.longitude);
    this._savePosition(position.coords.latitude, position.coords.longitude);
    this.setState({
      pending: false,
      GPS: true
    });
  }

  _positionErrorHandler(error) {
    if (('"No available location provider."' === JSON.stringify(error)) || (error.code && error.code === 1)) {
      //toastShort('请打开GPS开关');
      //没有开启位置服务
      this.setState({
        pending: false,
        GPS: false,
        tipsText: '请在设置中打开定位,以便查看附近的人'
      });
    } else if (error.code && error.code === 3) {
      this.setState({
        pending: false,
        GPS: false,
        tipsText: '请在设置中开启高精度定位后点此重试,以便获取更精确的位置信息'
      });
    } else {
      this.setState({
        pending: false,
        GPS: false,
        tipsText: '请在设置中打开定位,以便查看附近的人'
      });
    }
  }

  _initRegion(lat, lng) {
    let region = calculateRegion([{latitude: lat, longitude: lng}], {latPadding: 0.02, longPadding: 0.02});
    const lastPosition = {
      UserId: 0,
      PhotoUrl: 'http://oatl31bw3.bkt.clouddn.com/735510dbjw8eoo1nn6h22j20m80m8t9t.jpg',
      Nickname: 'You are here!',
      LastLocation: {
        Lat: lat,
        Lng: lng
      },
      DatingPurpose: ''
    };
    //console.log('成功获取当前区域', region);
    //console.log('成功获取当前位置', lastPosition);
    this.setState({
      locations: [lastPosition],
      region: region,
      pending: false,
    });
  }

  _savePosition(lat, lng) {
    const {dispatch}=this.props;
    dispatch(VicinityActions.saveCoordinate({Lat: lat, Lng: lng}));
  }

  fetchOptions(data) {
    return {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
  }

  onRegionChange(newRegion) {
    //console.log('显示区域发生了变化', newRegion);
    hasMove = true;
  }

  onRegionChangeComplete(newRegion) {
    let ne_long = newRegion.longitude + newRegion.longitudeDelta / 2;
    let sw_long = newRegion.longitude - newRegion.longitudeDelta / 2;
    let ne_lat = newRegion.latitude + newRegion.latitudeDelta / 2;
    let sw_lat = newRegion.latitude - newRegion.latitudeDelta / 2;

    const searchRegion = {
      ne_lat: ne_lat,
      ne_long: ne_long,
      sw_lat: sw_lat,
      sw_long: sw_long
    };
    // Fetch new data...
    //console.log('中心区域', newRegion);
    //console.log('搜索区域', searchRegion);

    const {dispatch} =this.props;
    //state变化会引起render重绘,继而重复执行onRegionChange方法
    //dispatch(VicinityActions.searchNearby(searchRegion));

    //console.log('搜索对比区域', compareRegion);
    //console.log('中心对比区域', compareCenterRegion);

    if (searchRegion.ne_lat != compareRegion.ne_lat) {
      //console.log('搜索区域发生变化');
      if (!this.props.pendingStatus) {
        compareRegion = searchRegion;
        compareCenterRegion = newRegion;
      }

      //参数处理
      const params = {
        TopRight: {
          Lat: searchRegion.ne_lat < 90 ? searchRegion.ne_lat : 89,
          Lng: searchRegion.ne_long < 180 ? searchRegion.ne_long : 179
        },
        BottomLeft: {
          Lat: searchRegion.sw_lat > -90 ? searchRegion.sw_lat : -89,
          Lng: searchRegion.sw_long > -180 ? searchRegion.sw_long : -179
        }
      };

      if (1 === searchTimes || hasMove) {
        //console.log('开始搜索附近的人');

        hasMove = false;
        searchTimes += 1;
        this.setState({pending: true, region: newRegion});

        fetch(URL_DEV + '/contacts/nearby', this.fetchOptions(params))
          .then(response => response.json())
          .then(json => {
            if ('OK' !== json.Code) {
              toastShort(json.Message);
            } else {
              //console.log('搜索结果', json);
              //console.log('附近的人搜索结束');
              this.setState({locations: json.Result, pending: false, region: newRegion});
            }
          }).catch((err)=> {
          //console.log(err);
          toastShort('网络发生错误,请重试');
        })
      }
    }
  }

  calloutPress(data) {
    const {dispatch}=this.props;
    let params = {
      UserId: data.UserId,
      ...tmpGlobal.currentLocation
    };
    dispatch(HomeActions.getUserInfo(params, (json)=> {
      dispatch(HomeActions.getUserPhotos({UserId: data.UserId}, (result)=> {
        pageNavigator.push({
          component: UserInfo,
          name: 'UserInfo',
          params: {
            Nickname: data.Nickname,
            UserId: data.UserId,
            myUserId: tmpGlobal.currentUser.UserId,
            ...json.Result,
            userPhotos: result.Result,
            myLocation: myLocation,
            isSelf: data.UserId === tmpGlobal.currentUser.UserId
          }
        });
      }, (error)=> {
      }));
    }, (error)=> {
    }));
  }

  renderMapMarkers(location) {
    return (
      <MapView.Marker
        key={location.UserId}
        coordinate={{latitude: location.LastLocation.Lat, longitude: location.LastLocation.Lng}}>
        <MapCallout location={location} onPress={()=> {
          this.calloutPress(location)
        }}/>
      </MapView.Marker>
    )
  }

  renderMapViews() {
    return (
      <MapView
        provider={"google"}
        style={styles.map}
        region={this.state.region}
        onRegionChangeComplete={(newRegion)=> {
          this.onRegionChangeComplete(newRegion)
        }}
        onRegionChange={(newRegion)=> {
          this.onRegionChange(newRegion);
        }}
        showsCompass={true}
        showsUserLocation={true}
        followsUserLocation={false}
        showsMyLocationButton={true}
        toolbarEnabled={false}
        loadingEnabled={false}
        showsScale={true}
        pitchEnabled={true}
      >
        {this.state.locations.map((location) => this.renderMapMarkers(location))}
      </MapView>
    )
  }

  renderSpinner() {
    if (this.state.pending || this.props.pendingStatus) {
      return (
        <Spinner animating={this.state.pending || this.props.pendingStatus}/>
      )
    }
  }

  refreshPage() {
    setTimeout(()=> {
      this.setState({pending: true, GPS: false});
      this.getPosition();
    }, 100);
  }

  renderWarningView(data) {
    if (data) {
      return (
        <TouchableHighlight
          onPress={()=> {
            this.refreshPage()
          }}
          underlayColor={'rgba(214,214,14,0.7)'}
          style={styles.gpsTips}>
          <View style={styles.tipsContent}>
            <Text style={styles.tipsText}>
              {this.state.tipsText}
            </Text>
          </View>
        </TouchableHighlight>
      )
    }
  }

  getNavigationBarProps() {
    return {
      title: '附近'
    };
  }

  renderBody() {
    return (
      <View style={styles.container}>
        {this.renderMapViews()}
        {this.renderWarningView(!this.state.GPS)}
      </View>
    )
  }

}

const mapStateToProps = (state) => {
  return {
    pendingStatus: state.Vicinity.pending,
    saveCoordinateStatus: state.Vicinity.asyncCoordinating
  }
};

export default connect(mapStateToProps)(Map)
