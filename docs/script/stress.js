import http from 'k6/http';
import { check, group, sleep, fail } from 'k6';

export let options = {
    stages: [
        { duration: '2m', target: 122 },
        { duration: '2m', target: 122 },
        { duration: '2m', target: 244 },
        { duration: '2m', target: 244 },
        { duration: '2m', target: 366 },
        { duration: '2m', target: 366 },
        { duration: '2m', target: 488 },
        { duration: '2m', target: 488 },
        { duration: '4m', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(99)<100']
    },
};

const BASE_URL = 'https://jaesungahn91.kro.kr';
const USERNAME = 'sung431@naver.com';
const PASSWORD = '1234';

export default function ()  {
    // 메인 페이지
    staticPage('', 'access main page');

    // 로그인 페이지
    staticPage('login', 'access login page');

    // 로그인 요청
    var accessToken = login(USERNAME, PASSWORD);
    // 경로 조회 페이지
    staticPage('path', 'access paths page');

    // 지하철역 목록 조회
    findStations();

    // 경로 검색 조회
    findPath(113, 100);

    // 즐겨찾기 목록 조회
    findFavorites(accessToken);
};

function staticPage(path, desc) {
    var page = http.get(`${BASE_URL}/${path}`);
    var obj = {};
    obj[desc] = (resp) => resp.status === 200;
    check(page, obj);
}

function login(email, password) {
    var payload = JSON.stringify({
        email: email,
        password: password,
    });

    var params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    let loginRes = http.post(`${BASE_URL}/login/token`, payload, params);

    check(loginRes, {
        'logged in successfully': (resp) => resp.json('accessToken') !== '',
    });

    return loginRes.json('accessToken');
}

function findStations() {
    let loginRes = http.get(`${BASE_URL}/stations`);

    check(loginRes, {
        'retrieved stations': (resp) => resp.status === 200,
    });
}

function findPath(source, target) {
    let loginRes = http.get(`${BASE_URL}/paths?source=${source}&target=${target}`);

    check(loginRes, {
        'retrieved path': (resp) => resp.status === 200,
    });
}

function findFavorites(accessToken) {
    let authHeaders = {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    };
    let loginRes = http.get(`${BASE_URL}/favorites`, authHeaders);

    check(loginRes, {
        'retrieved favorites': (resp) => resp.status === 200,
    });
}