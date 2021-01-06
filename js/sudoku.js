new Vue({
  el: '#app',
  data: {
    rowList: [], // 生成的数独
    time: '--', // 游戏时间
    cellValueList: {}, // 填入的数据
    abandon: false, // 放弃答题
    gameover: true, // 游戏结束
    gamestart: false, // 游戏开始
    difficultyLevel: -1, // 游戏难度等级，数字越大难度越大
    difficultyTextArr: ['简单', '普通', '困难', '极难'], // 难度对应文本数组
    pupopStatus: false // 难度选择弹窗显示状态
  },
  methods: {
    startGame () { // 开始游戏
      if (this.difficultyLevel > -1) {
        this.pupopStatus = false
        if (!this.gamestart) {
          this.gamestart = true
          this.gameover = false
          this.rowList.length = 9
          for (let i = 0; i < 9; i++) {
            const arr = []
            arr.length = 9
            this.rowList[i] = arr
          }
          setTimeout(() => {
            this.createSudoku()
          }, 1500)
        } else {
          this.resetGame()
        }
      } else {
        alert("请选择一个难度")
      }
    },
    resetGame () { // 重新开始游戏
      this.rowList = []
      this.time = 720 - this.difficultyLevel * 120
      this.cellValueList = {}
      this.abandon = false
      this.gameover = false
      this.createSudoku()
    },
    createSudoku () { // 生成数独，生成的不符合要求就会重新生成
      this.getKeyBlock()
      this.getOtherBlock([0], [4], 1)
      if (this.rowList[1].filter(val => val).length < 9) {
        this.createSudoku()
        return
      }
      this.getOtherBlock([0, 1], [8], 2)
      if (this.rowList[2].filter(val => val).length < 9) {
        this.createSudoku()
        return
      }
      this.getOtherBlock([4], [0], 3)
      if (this.rowList[3].filter(val => val).length < 9) {
        this.createSudoku()
        return
      }
      this.getOtherBlock([3, 4], [2, 8], 5)
      if (this.rowList[5].filter(val => val).length < 9) {
        this.createSudoku()
        return
      }
      this.getOtherBlock([8], [0, 3], 6)
      if (this.rowList[6].filter(val => val).length < 9) {
        this.createSudoku()
        return
      }
      this.getOtherBlock([6, 8], [1, 4], 7)
      if (this.rowList[7].filter(val => val).length < 9) {
        this.createSudoku()
        return
      }
      this.countZero()
      this.courseRating()
    },
    courseRating () { // 随机生成可以填写的数独块
      for (let index = 0; index < 9; index++) {
        for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
          const edit = Math.floor(Math.random() * 100) < this.difficultyLevel * 10 + 10
          if (edit) {
            this.cellValueList['cell-' + index + '-' + cellIndex] = ''
          }
          typeof (this.cellValueList['cell-' + index + '-' + cellIndex])
        }
      }
    },
    checkInput (e, index, cellIndex) { // 表单验证，只能输入单个1-9的数字
      const val = e.target.value.substring(0, 1).replace(/0|[\D]/g, '')
      this.cellValueList['cell-' + index + '-' + cellIndex] = val
      e.target.value = val
    },
    countZero () { // 倒计时
      const _this = this
      if (this.time <= 0) {
        alert('时间到，游戏结束')
        this.gameover = true
      } else if (!this.abandon) {
        setTimeout(() => {
          _this.time--
          _this.countZero()
        }, 1000)
      }
    },
    getKeyBlock () { // 0，4，8关键九宫格块使用随机排序生成
      const indexArr = [0, 4, 8]
      for (let i = 0; i < indexArr.length; i++) {
        const index = indexArr[i]
        const row = [1, 2, 3, 4, 5, 6, 7, 8, 9]
        this.rowList[index] = row.sort(() => Math.random() > 0.5 ? -1 : 1)
      }
    },
    getOtherBlock (colIndexArr, rowIndexArr, index) { // 其余位置九宫格块生成
      const rowList = []
      const colList = []
      const row = [1, 2, 3, 4, 5, 6, 7, 8, 9]
      for (let i = 0; i < rowIndexArr.length; i++) {
        const rowArr = this.rowList[rowIndexArr[i]]
        rowList[i] = [[rowArr[0], rowArr[3], rowArr[6]], [rowArr[1], rowArr[4], rowArr[7]], [rowArr[2], rowArr[5], rowArr[8]]]
      }
      for (let i = 0; i < colIndexArr.length; i++) {
        const colArr = this.rowList[colIndexArr[i]]
        colList[i] = [[colArr[0], colArr[1], colArr[2]], [colArr[3], colArr[4], colArr[5]], [colArr[6], colArr[7], colArr[8]]]
      }
      const resultArr = []
      for (let i = 0; i < 9; i++) {
        const rowIndex = i % 3
        const colIndex = parseInt(i / 3)
        const getUsableValue = function (value) {
          let count = 0
          for (let j = 0; j < rowList.length; j++) {
            if (rowList[j][rowIndex].some(val => val == value)) {
              count++
            }
          }
          for (let j = 0; j < colList.length; j++) {
            if (colList[j][colIndex].some(val => val == value)) {
              count++
            }
          }
          return count < 1
        }
        resultArr[i] = row.filter(getUsableValue)
      }
      this.getResultArr(resultArr, index)
    },
    getResultArr (resultArr, index) { // 根据单个九宫格块每个格子的可能值选出合适的值填入
      let realArr = []
      realArr.length = 9
      let copyResultArr = resultArr
      let numArr = [1, 2, 3, 4, 5, 6, 7, 8, 9]
      for (let i = 0; i < 9; i++) {
        const num = this.judgeCount(numArr, resultArr)
        let index = -1
        let minlength = 9
        for (let j = 0; j < resultArr.length; j++) {
          if (resultArr[j].indexOf(num) > -1) {
            if (minlength >= resultArr[j].length) {
              minlength = resultArr[j].length
              index = j
            }
            resultArr[j].splice(resultArr[j].indexOf(num), 1)
          }
        }
        numArr.splice(numArr.indexOf(num), 1)
        if (index > -1) {
          resultArr[index] = []
          realArr[index] = num
        }
      }
      this.rowList[index] = realArr
    },
    judgeCount (numArr, resultArr) { // 此处用来把可填数字中最少的数字优先填入
      let onlyNum = {
        num: 0,
        count: 9
      }
      for (let i = 0; i < numArr.length; i++) {
        const index = numArr[i]
        let count = 0
        for (let j = 0; j < resultArr.length; j++) {
          if (resultArr[j].indexOf(index) > -1) {
            count++
          }
        }
        if (count < onlyNum.count) {
          onlyNum = {
            num: index,
            count: count
          }
        }
      }
      return onlyNum.num
    },
    judgeSudoku () { // 判断数独填写结果
      let answer = this.rowList
      for (const key in this.cellValueList) {
        const element = this.cellValueList[key]
        if (element) {
          const keyIndex = key.split('-')
          answer[keyIndex[1]][keyIndex[2]] = parseInt(element)
        } else {
          alert('数独未填完')
          return
        }
      }
      if (this.judgeBlock(answer) && this.judgeCol(answer) && this.judgeRow(answer)) {
        alert('答案正确')
      } else {
        alert('答案错误')
      }
    },
    judgeCol (answer) { // 判断每一行
      for (let i = 0; i < 9; i += 3) {
        for (let j = 0; j < 9; j += 3) {
          const arr = (answer[i].slice(j, j + 3) + ',' + answer[i + 1].slice(j, j + 3) + ',' + answer[i + 2].slice(j, j + 3)).split(',')
          if (this.isRepeat(arr)) {
            return false
          }
        }
      }
      return true
    },
    judgeRow (answer) { // 判断每一列
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const arr = [answer[i][j], answer[i][j + 3], answer[i][j + 6], answer[i + 3][j], answer[i + 3][j + 3], answer[i + 3][j + 6], answer[i + 6][j], answer[i + 6][j + 3], answer[i + 6][j + 6]]
          if (this.isRepeat(arr)) {
            return false
          }
        }
      }
      return true
    },
    judgeBlock (answer) { // 判断每个九宫格块
      for (let i = 0; i < 9; i++) {
        if (this.isRepeat(answer[i])) {
          return false
        }
      }
      return true
    },
    isRepeat (arr) { // 判断数组中数据不重复
      return new Set(arr).size < 9
    },
    abandonAnswer () { // 放弃答题的操作
      const abandon = confirm('确定放弃此次答题？')
      if (abandon) {
        this.abandon = abandon
        this.gameover = true
      }
    },
    chooseDifficultyLevel (index) { // 选择游戏难度
      this.difficultyLevel = index
      this.time = 720 - this.difficultyLevel * 120
    }
  }
})