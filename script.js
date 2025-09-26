// 平均寿命データ
const AVERAGE_LIFESPAN = {
    male: 81,
    female: 87
};

// グローバル変数
let userData = null;
let countdownInterval = null;

// DOM要素の取得
const inputForm = document.getElementById('inputForm');
const timerDisplay = document.getElementById('timerDisplay');
const userForm = document.getElementById('userForm');
const birthDateInput = document.getElementById('birthDate');
const genderSelect = document.getElementById('gender');
const targetAgeInput = document.getElementById('targetAge');
const showSleepCountCheckbox = document.getElementById('showSleepCount');
const showMealCountCheckbox = document.getElementById('showMealCount');
const addFamilyBtn = document.getElementById('addFamilyBtn');
const familyContainer = document.getElementById('familyContainer');
const familyTimeDisplay = document.getElementById('familyTimeDisplay');
const familyTimeList = document.getElementById('familyTimeList');
const resetFormBtn = document.getElementById('resetFormBtn');
const clearAllDataBtn = document.getElementById('clearAllDataBtn');
const countdownYears = document.getElementById('countdownYears');
const countdownMonths = document.getElementById('countdownMonths');
const countdownDays = document.getElementById('countdownDays');
const countdownHours = document.getElementById('countdownHours');
const countdownMinutes = document.getElementById('countdownMinutes');
const countdownSeconds = document.getElementById('countdownSeconds');
const progressFill = document.getElementById('progressFill');
const progressPercentage = document.getElementById('progressPercentage');
const sleepCount = document.getElementById('sleepCount');
const mealCount = document.getElementById('mealCount');
const resetBtn = document.getElementById('resetBtn');

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    setupEventListeners();
    
    if (userData) {
        showTimer();
        startCountdown();
    } else {
        showForm();
    }
});

// イベントリスナーの設定
function setupEventListeners() {
    // フォーム送信
    userForm.addEventListener('submit', handleFormSubmit);
    
    // リセットボタン
    resetBtn.addEventListener('click', handleReset);
    
    // 家族追加ボタン
    addFamilyBtn.addEventListener('click', addFamilyMember);
    
    // フォームリセットボタン
    resetFormBtn.addEventListener('click', handleFormReset);
    
    // 全データ削除ボタン
    clearAllDataBtn.addEventListener('click', handleClearAllData);
    
    // 性別変更時の目標寿命自動設定
    genderSelect.addEventListener('change', updateTargetAge);
}

// フォーム送信処理
function handleFormSubmit(e) {
    e.preventDefault();
    
    const birthDate = new Date(birthDateInput.value);
    const gender = genderSelect.value;
    const targetAge = targetAgeInput.value ? parseInt(targetAgeInput.value) : null;
    
    // バリデーション
    if (!birthDateInput.value || !gender) {
        alert('生年月日と性別を入力してください。');
        return;
    }
    
    if (birthDate > new Date()) {
        alert('生年月日は過去の日付を入力してください。');
        return;
    }
    
    if (targetAge && (targetAge < 1 || targetAge > 150)) {
        alert('目標寿命は1〜150歳の範囲で入力してください。');
        return;
    }
    
    // 家族データの取得
    const familyData = getFamilyData();
    
    // ユーザーデータの保存
    userData = {
        birthDate: birthDate.toISOString(),
        gender: gender,
        targetAge: targetAge || AVERAGE_LIFESPAN[gender],
        showSleepCount: showSleepCountCheckbox.checked,
        showMealCount: showMealCountCheckbox.checked,
        family: familyData
    };
    
    saveUserData();
    showTimer();
    startCountdown();
}

// 性別変更時の目標寿命自動設定
function updateTargetAge() {
    const gender = genderSelect.value;
    if (gender && !targetAgeInput.value) {
        targetAgeInput.placeholder = `デフォルト: ${AVERAGE_LIFESPAN[gender]}歳`;
    }
}


// タイマー開始
function startCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    countdownInterval = setInterval(updateDisplay, 1000);
    updateDisplay();
}

// 表示更新
function updateDisplay() {
    if (!userData) return;
    
    const now = new Date();
    const birthDate = new Date(userData.birthDate);
    const targetDate = new Date(birthDate);
    targetDate.setFullYear(targetDate.getFullYear() + userData.targetAge);
    
    const remainingTime = targetDate - now;
    
    if (remainingTime <= 0) {
        countdownYears.textContent = '00';
        countdownMonths.textContent = '00';
        countdownDays.textContent = '00';
        countdownHours.textContent = '00';
        countdownMinutes.textContent = '00';
        countdownSeconds.textContent = '00';
        
        // プログレスインジケータを100%に設定
        updateProgressIndicator(0, userData.targetAge);
        
        if (userData.showSleepCount) {
            sleepCount.textContent = '0';
            sleepCount.parentElement.style.display = 'flex';
        } else {
            sleepCount.parentElement.style.display = 'none';
        }
        if (userData.showMealCount) {
            mealCount.textContent = '0';
            mealCount.parentElement.style.display = 'flex';
        } else {
            mealCount.parentElement.style.display = 'none';
        }
        updateFamilyTimeDisplay();
        return;
    }
    
    // 残り時間の計算（yyyy:mm:dd:hh:mm:ss形式）
    const remainingYears = Math.floor(remainingTime / (365.25 * 24 * 60 * 60 * 1000));
    const remainingMonths = Math.floor((remainingTime % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000));
    const remainingDays = Math.floor((remainingTime % (30.44 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000));
    const remainingHours = Math.floor((remainingTime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const remainingMinutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
    const remainingSeconds = Math.floor((remainingTime % (60 * 1000)) / 1000);
    
    // 個別の数字要素を更新
    countdownYears.textContent = remainingYears.toString().padStart(2, '0');
    countdownMonths.textContent = remainingMonths.toString().padStart(2, '0');
    countdownDays.textContent = remainingDays.toString().padStart(2, '0');
    countdownHours.textContent = remainingHours.toString().padStart(2, '0');
    countdownMinutes.textContent = remainingMinutes.toString().padStart(2, '0');
    countdownSeconds.textContent = remainingSeconds.toString().padStart(2, '0');
    
    // プログレスインジケータを更新
    updateProgressIndicator(remainingTime, userData.targetAge);
    
    // 行動回数の計算と表示
    const remainingDaysForActions = Math.ceil(remainingTime / (24 * 60 * 60 * 1000));
    const sleepRemaining = Math.max(0, remainingDaysForActions);
    const mealRemaining = Math.max(0, remainingDaysForActions * 3);
    
    // 表示設定に応じて行動回数を表示/非表示
    if (userData.showSleepCount) {
        sleepCount.textContent = sleepRemaining.toLocaleString();
        sleepCount.parentElement.style.display = 'flex';
    } else {
        sleepCount.parentElement.style.display = 'none';
    }
    
    if (userData.showMealCount) {
        mealCount.textContent = mealRemaining.toLocaleString();
        mealCount.parentElement.style.display = 'flex';
    } else {
        mealCount.parentElement.style.display = 'none';
    }
    
    // 家族との時間を表示（リアルタイム更新）
    updateFamilyTimeDisplay();
}


// フォーム表示
function showForm() {
    inputForm.style.display = 'block';
    timerDisplay.style.display = 'none';
    // フォームの入力内容を復元
    restoreFormData();
}

// タイマー表示
function showTimer() {
    inputForm.style.display = 'none';
    timerDisplay.style.display = 'block';
}

// 設定画面表示（右上の歯車ボタン）
function handleReset() {
    clearInterval(countdownInterval);
    showForm();
}

// フォームリセット処理（設定画面のリセットボタン）
function handleFormReset() {
    if (confirm('入力内容をリセットしますか？')) {
        userForm.reset();
        targetAgeInput.placeholder = '自動設定';
        // 家族データもクリア
        familyContainer.innerHTML = '';
    }
}

// 全データ削除処理
function handleClearAllData() {
    if (confirm('すべてのデータを削除しますか？この操作は元に戻せません。')) {
        clearInterval(countdownInterval);
        userData = null;
        localStorage.removeItem('lifeTimerData');
        userForm.reset();
        targetAgeInput.placeholder = '自動設定';
        familyContainer.innerHTML = '';
        alert('すべてのデータが削除されました。');
    }
}

// ユーザーデータの保存
function saveUserData() {
    if (userData) {
        localStorage.setItem('lifeTimerData', JSON.stringify(userData));
    }
}

// ユーザーデータの読み込み
function loadUserData() {
    const savedData = localStorage.getItem('lifeTimerData');
    if (savedData) {
        try {
            userData = JSON.parse(savedData);
            // 生年月日と性別をフォームに設定
            if (userData.birthDate) {
                birthDateInput.value = userData.birthDate.split('T')[0];
            }
            if (userData.gender) {
                genderSelect.value = userData.gender;
            }
            if (userData.targetAge) {
                targetAgeInput.value = userData.targetAge;
            }
            // チェックボックスの状態を復元
            if (userData.showSleepCount !== undefined) {
                showSleepCountCheckbox.checked = userData.showSleepCount;
            }
            if (userData.showMealCount !== undefined) {
                showMealCountCheckbox.checked = userData.showMealCount;
            }
            // 家族データの復元
            if (userData.family && userData.family.length > 0) {
                userData.family.forEach((member, index) => {
                    addFamilyMember();
                    const familyMember = familyContainer.children[index];
                    familyMember.querySelector('.family-name').value = member.name;
                    familyMember.querySelector('.family-relationship').value = member.relationship;
                    familyMember.querySelector('.family-gender').value = member.gender;
                    familyMember.querySelector('.family-birthdate').value = member.birthDate;
                });
            }
        } catch (e) {
            console.error('保存されたデータの読み込みに失敗しました:', e);
            userData = null;
        }
    }
}

// 家族メンバー追加
function addFamilyMember() {
    const familyMemberDiv = document.createElement('div');
    familyMemberDiv.className = 'family-member';
    familyMemberDiv.innerHTML = `
        <div class="family-member-header">
            <div class="family-member-title">家族メンバー ${familyContainer.children.length + 1}</div>
            <button type="button" class="remove-family-btn" onclick="removeFamilyMember(this)">×</button>
        </div>
        <div class="family-member-fields">
            <div class="form-group">
                <label>名前</label>
                <input type="text" class="family-name" placeholder="家族の名前" required>
            </div>
            <div class="form-group">
                <label>続柄</label>
                <select class="family-relationship" required>
                    <option value="">選択してください</option>
                    <option value="parent">親</option>
                    <option value="partner">パートナー</option>
                    <option value="child">子供</option>
                </select>
            </div>
            <div class="form-group">
                <label>性別</label>
                <select class="family-gender" required>
                    <option value="">選択してください</option>
                    <option value="male">男性</option>
                    <option value="female">女性</option>
                </select>
            </div>
            <div class="form-group">
                <label>生年月日</label>
                <input type="date" class="family-birthdate" required>
            </div>
        </div>
    `;
    familyContainer.appendChild(familyMemberDiv);
}

// 家族メンバー削除
function removeFamilyMember(button) {
    button.closest('.family-member').remove();
}

// 家族データの取得
function getFamilyData() {
    const familyMembers = familyContainer.querySelectorAll('.family-member');
    const familyData = [];
    
    familyMembers.forEach(member => {
        const name = member.querySelector('.family-name').value;
        const relationship = member.querySelector('.family-relationship').value;
        const gender = member.querySelector('.family-gender').value;
        const birthDate = member.querySelector('.family-birthdate').value;
        
        if (name && relationship && gender && birthDate) {
            familyData.push({
                name: name,
                relationship: relationship,
                gender: gender,
                birthDate: birthDate
            });
        }
    });
    
    return familyData;
}

// 家族との時間表示更新
function updateFamilyTimeDisplay() {
    if (!userData || !userData.family || userData.family.length === 0) {
        familyTimeDisplay.style.display = 'none';
        return;
    }
    
    familyTimeDisplay.style.display = 'block';
    familyTimeList.innerHTML = '';
    
    const now = new Date();
    const userBirthDate = new Date(userData.birthDate);
    const userAge = Math.floor((now - userBirthDate) / (365.25 * 24 * 60 * 60 * 1000));
    
    userData.family.forEach(member => {
        const memberBirthDate = new Date(member.birthDate);
        const memberAge = Math.floor((now - memberBirthDate) / (365.25 * 24 * 60 * 60 * 1000));
        
        let timeTogether = '';
        let details = '';
        
        if (member.relationship === 'child') {
            // 子供の場合：成人まで（18歳）の時間
            const adultDate = new Date(memberBirthDate);
            adultDate.setFullYear(adultDate.getFullYear() + 18);
            const timeToAdult = adultDate - now;
            
            if (timeToAdult > 0) {
                const years = Math.floor(timeToAdult / (365.25 * 24 * 60 * 60 * 1000));
                const months = Math.floor((timeToAdult % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000));
                const days = Math.floor((timeToAdult % (30.44 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000));
                const hours = Math.floor((timeToAdult % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
                const minutes = Math.floor((timeToAdult % (60 * 60 * 1000)) / (60 * 1000));
                const seconds = Math.floor((timeToAdult % (60 * 1000)) / 1000);
                
                timeTogether = `${years.toString().padStart(2, '0')}:${months.toString().padStart(2, '0')}:${days.toString().padStart(2, '0')}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                details = `成人まで（現在${memberAge}歳）`;
            } else {
                timeTogether = '00:00:00:00:00:00';
                details = '既に成人しています';
            }
        } else {
            // 親・パートナーの場合：一緒に過ごせる時間
            const userLifespan = userData.targetAge;
            const memberLifespan = AVERAGE_LIFESPAN[member.gender];
            
            // 現在時刻から各人の寿命までの残り時間を計算
            const userBirthDate = new Date(userData.birthDate);
            const userTargetDate = new Date(userBirthDate);
            userTargetDate.setFullYear(userTargetDate.getFullYear() + userLifespan);
            const userRemainingTime = userTargetDate - now;
            
            const memberTargetDate = new Date(memberBirthDate);
            memberTargetDate.setFullYear(memberTargetDate.getFullYear() + memberLifespan);
            const memberRemainingTime = memberTargetDate - now;
            
            // 短い方の残り時間を使用
            const togetherTime = Math.min(userRemainingTime, memberRemainingTime);
            
            if (togetherTime > 0) {
                const years = Math.floor(togetherTime / (365.25 * 24 * 60 * 60 * 1000));
                const months = Math.floor((togetherTime % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000));
                const days = Math.floor((togetherTime % (30.44 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000));
                const hours = Math.floor((togetherTime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
                const minutes = Math.floor((togetherTime % (60 * 60 * 1000)) / (60 * 1000));
                const seconds = Math.floor((togetherTime % (60 * 1000)) / 1000);
                
                timeTogether = `${years.toString().padStart(2, '0')}:${months.toString().padStart(2, '0')}:${days.toString().padStart(2, '0')}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                details = `一緒に過ごせる時間（あなた: ${Math.floor(userRemainingTime / (365.25 * 24 * 60 * 60 * 1000))}年、${member.name}: ${Math.floor(memberRemainingTime / (365.25 * 24 * 60 * 60 * 1000))}年）`;
            } else {
                timeTogether = '00:00:00:00:00:00';
                details = '既に時間がありません';
            }
        }
        
        const familyTimeItem = document.createElement('div');
        familyTimeItem.className = 'family-time-item';
        familyTimeItem.innerHTML = `
            <div class="family-time-header">
                <div class="family-time-name">${member.name}との時間</div>
                <div class="family-time-relationship">${getRelationshipText(member.relationship)}</div>
                <div class="family-time-details">${details}</div>
            </div>
            <div class="family-time-grid">
                <div class="family-time-item-unit">
                    <div class="family-time-number" id="familyYears${member.name}">${timeTogether.split(':')[0]}</div>
                    <div class="family-time-unit">年</div>
                </div>
                <div class="family-time-item-unit">
                    <div class="family-time-number" id="familyMonths${member.name}">${timeTogether.split(':')[1]}</div>
                    <div class="family-time-unit">ヶ月</div>
                </div>
                <div class="family-time-item-unit">
                    <div class="family-time-number" id="familyDays${member.name}">${timeTogether.split(':')[2]}</div>
                    <div class="family-time-unit">日</div>
                </div>
                <div class="family-time-item-unit">
                    <div class="family-time-number" id="familyHours${member.name}">${timeTogether.split(':')[3]}</div>
                    <div class="family-time-unit">時間</div>
                </div>
                <div class="family-time-item-unit">
                    <div class="family-time-number" id="familyMinutes${member.name}">${timeTogether.split(':')[4]}</div>
                    <div class="family-time-unit">分</div>
                </div>
                <div class="family-time-item-unit">
                    <div class="family-time-number" id="familySeconds${member.name}">${timeTogether.split(':')[5]}</div>
                    <div class="family-time-unit">秒</div>
                </div>
            </div>
        `;
        familyTimeList.appendChild(familyTimeItem);
    });
}

// 続柄テキスト取得
function getRelationshipText(relationship) {
    const relationships = {
        'parent': '親',
        'partner': 'パートナー',
        'child': '子供'
    };
    return relationships[relationship] || relationship;
}

// プログレスインジケータの更新
function updateProgressIndicator(remainingTime, targetAge) {
    if (!userData) return;
    
    const now = new Date();
    const birthDate = new Date(userData.birthDate);
    const userAge = Math.floor((now - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
    
    // 人生の進捗率を計算（0-100%）
    const progressPercentage = Math.min(100, Math.max(0, (userAge / targetAge) * 100));
    
    // プログレスバーの幅を更新
    progressFill.style.width = `${progressPercentage}%`;
    
    // パーセンテージテキストを更新
    progressPercentage.textContent = `${Math.round(progressPercentage)}%`;
    
    // 色を進捗に応じて変更
    // if (progressPercentage < 25) {
    //     progressFill.style.background = 'linear-gradient(90deg, #ff6b6b, #ff8e8e)';
    // } else if (progressPercentage < 50) {
    //     progressFill.style.background = 'linear-gradient(90deg, #ffa500, #ffb84d)';
    // } else if (progressPercentage < 75) {
    //     progressFill.style.background = 'linear-gradient(90deg, #ffd700, #ffed4e)';
    // } else {
    //     progressFill.style.background = 'linear-gradient(90deg, #32cd32, #66ff66)';
    // }
}

// フォームデータの復元
function restoreFormData() {
    if (userData) {
        // 基本情報の復元
        if (userData.birthDate) {
            birthDateInput.value = userData.birthDate.split('T')[0];
        }
        if (userData.gender) {
            genderSelect.value = userData.gender;
        }
        if (userData.targetAge) {
            targetAgeInput.value = userData.targetAge;
        }
        if (userData.showSleepCount !== undefined) {
            showSleepCountCheckbox.checked = userData.showSleepCount;
        }
        if (userData.showMealCount !== undefined) {
            showMealCountCheckbox.checked = userData.showMealCount;
        }
        
        // 家族データの復元
        if (userData.family && userData.family.length > 0) {
            // 既存の家族データをクリア
            familyContainer.innerHTML = '';
            
            userData.family.forEach((member, index) => {
                addFamilyMember();
                const familyMember = familyContainer.children[index];
                familyMember.querySelector('.family-name').value = member.name;
                familyMember.querySelector('.family-relationship').value = member.relationship;
                familyMember.querySelector('.family-gender').value = member.gender;
                familyMember.querySelector('.family-birthdate').value = member.birthDate;
            });
        }
    }
}
