// Promise 原理及最佳实践
const createAudioFileAsync = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('audio file created');
    }, 1000);
  });
};
const sucessCallback = () => {
  console.log('data');
};

createAudioFileAsync().then(sucessCallback, sucessCallback)

class MyPromise {
  constructor(executor: Function) {
    executor();
  }
  then(onFulfilled: Function, onRejected: Function) {
    console.log('then');
    onFulfilled();
  }
  catch(onRejected: Function) {
    console.log('catch');
    onRejected();
  }
  all(list:Promise<any>[]): Promise<any> {
    console.log('start')
    return new Promise((resolve, reject) => {
        let result = []
        for (let i = 0; i < list.length; i++) {
            list[i].then(res => {
                result[i] = res
                if (i === list.length - 1) {
                    console.log(1111)
                    resolve(result)
                }
            })
        }
    })
}
}

// 重写promise.all方法
// Promise.all = function(list:Promise<any>[]): Promise<any> {
//     console.log('start')
//     return new Promise((resolve, reject) => {
//         let result = []
//         for (let i = 0; i < list.length; i++) {
//             list[i].then(res => {
//                 result[i] = res
//                 if (i === list.length - 1) {
//                     console.log(1111)
//                     resolve(result)
//                 }
//             })
//         }
//     })
// }

const func1 = (): Promise<any> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('func1')
        }, 1000)
    })
}

const func2 = (): Promise<any> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('func2')
        }, 1000)
    })
}

const func3 = (): Promise<any> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('func3')
        }, 1000)
    })
}
const MyPromise1 = new MyPromise((resolve: Function, reject: Function) => {
        setTimeout(() => {
            resolve('init')
        }, 1000)
    })
MyPromise1.all([func1(), func2(), func3()]).then(res => {
    console.log(res)
})
