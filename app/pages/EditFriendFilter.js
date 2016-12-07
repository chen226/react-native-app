/**
 *
 * @author keyy/1501718947@qq.com 16/12/6 20:40
 * @description
 */
import React, {Component} from 'react'
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  TouchableHighlight
} from 'react-native'
import * as InitialAppActions from '../actions/InitialApp'
import {connect} from 'react-redux'
import {componentStyles} from '../style'
import BaseComponent from '../base/BaseComponent'
import {Button as NBButton} from 'native-base'
import * as HomeActions from '../actions/Home'
import RNPicker from 'react-native-picker'
import * as FriendFilterActions from '../actions/FriendFilter'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E2E2E2'
  },
  friendInfo:{
    backgroundColor:'#fff',
    paddingHorizontal:10,
    marginTop:10
  },
  scrollViewContainer:{
    paddingHorizontal:10,
    flex:1
  },
  inputLabel:{
    width:100
  },
  topItem:{
    borderTopWidth:1,
    borderTopColor:'#d4cfcf'
  },
  bottomItem:{
    borderBottomWidth:0
  },
  itemRow:{
    flexDirection:'row'
  },
  listItem:{
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#d4cfcf',
    alignItems: 'center'
  },
  saveBtn:{
    marginVertical:30
  },
  pickerItem: {
    flex: 1,
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
    paddingHorizontal: 10
  },
  pickerTextView: {
    flex: 1
  },
  pickerText: {
    textAlignVertical: 'center'
  },
  emotionStatusIOS: {
    flex: 1,
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
    paddingHorizontal: 10
  },
  emotionStatusIOSView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  emotionStatusIOSText: {
    textAlignVertical: 'center'
  },
});

const tmpGenderArr = ['不限', '男', '女'];
const tmpPhotoOnlyArr = ['不限', '是', '否'];

class EditFriendFilter extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...this.props.route.params,
      ageRangeText:`${this.props.route.params.AgeMin}-${this.props.route.params.AgeMax}岁`,
      heightRangeText:`${this.props.route.params.HeightMin}-${this.props.route.params.HeightMax}cm`,
      weightRangeText:`${this.props.route.params.WeightMin}-${this.props.route.params.WeightMax}kg`,
      genderText:'不限',
      photoOnlyText:this.props.route.params.PhotoOnly===null?'不限':(this.props.route.params.PhotoOnly?'是':'否')
    };
    console.log(this.props.route.params);
  }

  getNavigationBarProps() {
    return {
      title: '交友信息'
    };
  }

  _saveFriendFilter(){
    const{dispatch,navigator}=this.props;
    let data={
      AgeMin:this.state.AgeMin,
      AgeMax:this.state.AgeMax,
      HeightMin:this.state.HeightMin,
      HeightMax:this.state.HeightMax,
      Gender:this.state.Gender,
      PhotoOnly:this.state.PhotoOnly,
      WeightMin:this.state.WeightMin,
      WeightMax:this.state.WeightMax
    };
    dispatch(FriendFilterActions.editFriendFilter(data,(json)=>{
      navigator.pop();
      this.state.callBack(data);
    },(error)=>{}));
  }

  _createAgeRangeData() {
    let data = [], unLimitAge = [];
    unLimitAge.push('不限');
    for (let m = 18; m < 81; m++) {
      unLimitAge.push(m + '');
    }
    data.push({'不限': unLimitAge});
    for (let i = 18; i < 80; i++) {
      let maxAge = [];
      for (let j = 19; j < 81; j++) {
        if (i < j) {
          if (maxAge.indexOf('不限') < 0) {
            maxAge.push('不限');
          }
          maxAge.push(j + '');
        }
      }
      let _maxAge = {};
      _maxAge[i + ''] = maxAge;
      data.push(_maxAge);
    }
    return data;
  }

  _createHeightRangeData() {
    let data = [];
    data.push({'不限': ['不限']});
    for (let i = 100; i < 200; i++) {
      let maxHeight = [];
      for (let j = 101; j < 201; j++) {
        if (i < j) {
          if (maxHeight.indexOf('不限') < 0) {
            maxHeight.push('不限');
          }
          maxHeight.push(j + '');
        }
      }
      let _maxHeight = {};
      _maxHeight[i + ''] = maxHeight;
      data.push(_maxHeight);
    }
    return data;
  }

  _createWeightRangeData(){
    let data=[];
    data.push({'不限':['不限']});
    for(let i=20;i<200;i++){
      let maxWeight=[];
      for(let j=21;j<201;j++){
        if(i<j){
          if(maxWeight.indexOf('不限')<0){
            maxWeight.push('不限');
          }
          maxWeight.push(j+'');
        }
      }
      let _maxWeight = {};
      _maxWeight[i + ''] = maxWeight;
      data.push(_maxWeight);
    }
    return data;
  }

  _renderDoublePicker(text, title, minValue, maxValue, _createData) {
    return (
      <TouchableHighlight
        onPress={()=> {
          this._showDoublePicker(_createData, text, title, minValue, maxValue);
        }}
        style={styles.pickerItem}
        activeOpacity={0.5}
        underlayColor="rgba(247,245,245,0.7)">
        <View style={styles.pickerTextView}>
          <Text style={styles.pickerText}>
            {this.state[`${text}`]}
          </Text>
        </View>
      </TouchableHighlight>
    )
  }

  //双选择项范围弹窗
  _showDoublePicker(_createData, text, title, minValue, maxValue){
    RNPicker.init({
      pickerTitleText: title,
      pickerData: _createData,
      selectedValue: [`${minValue}`, `${maxValue}`],
      onPickerConfirm: pickedValue => {
        this._updateState(text, pickedValue);
        RNPicker.hide();
      },
      onPickerCancel: pickedValue => {
        RNPicker.hide();
      },
      onPickerSelect: pickedValue => {
        this._updateState(text, pickedValue);
      }
    });
    RNPicker.show();
  }

  _renderSinglePicker(text, title, value, _createData) {
    return (
      <TouchableHighlight
        onPress={()=> {
          this._showSinglePicker(_createData, text, title, value);
        }}
        style={styles.pickerItem}
        activeOpacity={0.5}
        underlayColor="rgba(247,245,245,0.7)">
        <View style={styles.pickerTextView}>
          <Text style={styles.pickerText}>
            {this.state[`${text}`]}
          </Text>
        </View>
      </TouchableHighlight>
    )
  }

  _showSinglePicker(_createData, text, title, value) {
    RNPicker.init({
      pickerTitleText: title,
      pickerData: _createData,
      selectedValue: [this.state[`${text}`]],
      onPickerConfirm: pickedValue => {
        this._updateState(text, pickedValue);
        RNPicker.hide();
      },
      onPickerCancel: pickedValue => {
        RNPicker.hide();
      },
      onPickerSelect: pickedValue => {
        this._updateState(text, pickedValue);
      }
    });
    RNPicker.show();
  }

  _updateState(text, pickedValue) {
    switch (text) {
      case 'ageRangeText':
        if (pickedValue[0] == '不限' && pickedValue[1] == '不限') {
          this.setState({
            ageRangeText: '不限',
            AgeMin: null,
            AgeMax: null
          });
        } else if (pickedValue[0] == '不限' && pickedValue[1] != '不限') {
          this.setState({
            ageRangeText: `${pickedValue[1]}岁以下`,
            AgeMin: null,
            AgeMax: parseInt(pickedValue[1])
          });
        } else if (pickedValue[0] != '不限' && pickedValue[1] == '不限') {
          this.setState({
            ageRangeText: `${pickedValue[0]}岁以上`,
            AgeMin: parseInt(pickedValue[0]),
            AgeMax: null
          });
        } else {
          this.setState({
            ageRangeText: `${pickedValue[0]}-${pickedValue[1]}岁`,
            AgeMin: parseInt(pickedValue[0]),
            AgeMax: parseInt(pickedValue[1])
          });
        }
        break;
      case 'heightRangeText':
        if (pickedValue[0] == '不限') {
          this.setState({
            heightRangeText: '不限',
            HeightMin: 100,
            HeightMax: 200
          });
        } else if (pickedValue[0] != '不限' && pickedValue[1] == '不限') {
          this.setState({
            heightRangeText: `${pickedValue[0]}cm以上`,
            HeightMin: parseInt(pickedValue[0]),
            HeightMax: 80
          });
        } else {
          this.setState({
            heightRangeText: `${pickedValue[0]}-${pickedValue[1]}cm`,
            HeightMin: parseInt(pickedValue[0]),
            HeightMax: parseInt(pickedValue[1])
          });
        }
        break;
      case 'weightRangeText':
        if(pickedValue[0]=='不限'){
          this.setState({
            weightRangeText:'不限',
            WeightMin:20,
            WeightMax:200
          })
        }else if(pickedValue[0] != '不限' && pickedValue[1] == '不限'){
          this.setState({
            weightRangeText: `${pickedValue[0]}kg以上`,
            WeightMin: parseInt(pickedValue[0]),
            WeightMax: 200
          });
        }else{
          this.setState({
            weightRangeText: `${pickedValue[0]}-${pickedValue[1]}kg`,
            WeightMin: parseInt(pickedValue[0]),
            WeightMax: parseInt(pickedValue[1])
          });
        }
        break;
      case 'genderText':
        this.setState({
          genderText: pickedValue[0],
          Gender: pickedValue[0] == '不限' ? null : pickedValue[0] == '男'
        });
        break;
      case 'photoOnlyText':
        this.setState({
          photoOnlyText: pickedValue[0],
          PhotoOnly: pickedValue[0] == '不限' ? null : pickedValue[0] == '是'
        });
        break;
      default:
        console.error('设置数据出错!');
        break;
    }
  }

  renderBody() {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.scrollViewContainer}>
          <View style={styles.friendInfo}>
            <View style={[styles.listItem]}>
              <Text style={styles.inputLabel}>{'年龄'}</Text>
              {this._renderDoublePicker('ageRangeText', '请选择年龄范围', this.state.AgeMin + '', this.state.AgeMax + '', this._createAgeRangeData())}
            </View>
            <View style={[styles.listItem]}>
              <Text style={styles.inputLabel}>{'性别'}</Text>
              {this._renderSinglePicker('genderText', '请选择性别', 'Gender', tmpGenderArr)}
            </View>
            <View style={[styles.listItem]}>
              <Text style={styles.inputLabel}>{'身高'}</Text>
              {this._renderDoublePicker('heightRangeText', '请选择身高范围', this.state.HeightMin + '', this.state.HeightMax + '', this._createHeightRangeData())}
            </View>
            <View style={[styles.listItem]}>
              <Text style={styles.inputLabel}>{'体重'}</Text>
              {this._renderDoublePicker('weightRangeText', '请选择体重范围', this.state.WeightMin + '', this.state.WeightMax + '', this._createWeightRangeData())}
            </View>
            <View style={[styles.listItem,styles.bottomItem]}>
              <Text style={styles.inputLabel}>{'只看有照片的人'}</Text>
              {this._renderSinglePicker('photoOnlyText', '是否只看有照片的人', this.state.Gender, tmpPhotoOnlyArr)}
            </View>
          </View>
          <NBButton
            block
            style={styles.saveBtn}
            onPress={()=> {
              this._saveFriendFilter()
            }}>
            保存
          </NBButton>
        </ScrollView>
      </View>
    )
  }

}
export default connect((state)=> {
  return {
    ...state
  }
})(EditFriendFilter)