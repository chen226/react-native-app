/**
 *
 * @author keyy/1501718947@qq.com 16/11/15 14:28
 * @description
 */
import * as ActionTypes from './ActionTypes'
import {URL_DEV} from '../constants/Constant'
import {toastShort} from '../utils/ToastUtil'
import {Actions} from 'react-native-router-flux'

function fetchOptions(data) {
  return {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }
}

function fetchOptionsGet() {
  return {
    method: 'GET'
  }
}

export function getUserProfile() {
  return (dispatch)=> {
    dispatch(requestUserProfile());
    fetch(URL_DEV + '/profile', fetchOptionsGet())
      .then(response => response.json())
      .then(json => {
        dispatch(receiveUserProfile(json));
        if ('OK' !== json.Code) {
          toastShort(json.Message);
        } else {
          let str = json.Result.DatingPurpose + '';
          const params = {
            Nickname: json.Result.Nickname ? json.Result.Nickname + '' : '',
            Username: json.Result.Username ? json.Result.Username + '' : '',
            DatingPurpose: '',
            MapPrecision: json.Result.MapPrecision + '',
            IsFullyRegistered: json.Result.IsFullyRegistered,
            HasSavedUserProfile: !!json.Result.Nickname,
            BirthYear: json.Result.BirthYear ? json.Result.BirthYear + '' : '',
            HasSavedBirthYear: !!json.Result.BirthYear,
            Ethnicity: json.Result.Ethnicity ? json.Result.Ethnicity + '' : '',
            HasSavedEthnicity: !!json.Result.Ethnicity,
            Gender: 'undefined'==typeof json.Result.Gender || json.Result.Gender==true ? '1' : '0',
            HasSavedGender: !!json.Result.Gender,
            Height: json.Result.Height ? json.Result.Height + '' : '',
            HasSavedHeight: !!json.Result.Height,
            Weight: json.Result.Weight ? json.Result.Weight + '' : '',
            MobileNo: json.Result.MobileNo || null,
            Love: str.indexOf('Love') > -1,
            Relationship: str.indexOf('Relationship') > -1,
            Friendship: str.indexOf('Friendship') > -1,
            Others: str.indexOf('Others') > -1
          };
          Actions.userProfile({param: params});
        }
      }).catch((err)=> {
      dispatch(receiveUserProfile(err));
      toastShort('网络发生错误,请重试')
    })
  };
}

function requestUserProfile() {
  return {
    type: ActionTypes.FETCH_USER_PROFILE
  }
}

function receiveUserProfile(json) {
  return {
    type: ActionTypes.RECEIVE_USER_PROFILE,
    json
  }
}

export function saveUserProfile(data) {
  //这里对参数做处理
  let tmpArr = [];
  if (data.Love) {
    tmpArr.push('Love');
  }
  if (data.Relationship) {
    tmpArr.push('Relationship');
  }
  if (data.Friendship) {
    tmpArr.push('Friendship');
  }
  if (data.Others) {
    tmpArr.push('Others');
  }

  const params = {
    Nickname: data.Nickname,
    IsFullyRegistered: true,
    Ethnicity: data.Ethnicity || null,
    MobileNo: data.MobileNo,
    BirthYear: data.BirthYear ? parseInt(data.BirthYear) : null,
    Gender: data.Gender == '1',
    Height: data.Height ? parseInt(data.Height) : null,
    Weight: data.Weight ? parseInt(data.Weight) : null,
    DatingPurpose: tmpArr.length > 0 ? tmpArr.join(",") : null,
    MapPrecision: parseInt(data.MapPrecision),
    PhotoUrl: null
  };

  return (dispatch)=> {
    //这里对交友目的做处理
    dispatch(requestSaveUserProfile(params));
    fetch(URL_DEV + '/profile', fetchOptions(params))
      .then(response => response.json())
      .then(json => {
        dispatch(receiveSaveUserProfile(params, json));
        if ('OK' !== json.Code) {
          toastShort(json.Message);
        } else {
          Actions.photos({new:true});
        }
      }).catch((err)=> {
      dispatch(receiveSaveUserProfile(params, err));
      toastShort('网络发生错误,请重试')
    })
  };
}

function requestSaveUserProfile(data) {
  return {
    type: ActionTypes.FETCH_SAVE_USER_PROFILE,
    data
  }
}

function receiveSaveUserProfile(data, json) {
  return {
    type: ActionTypes.RECEIVE_SAVE_USER_PROFILE,
    data,
    json
  }
}