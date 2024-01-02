document.getElementById('submit-button').addEventListener('click', async () => {
  const userInput = document.getElementById('user-input').value;
  const submitButton = document.getElementById('submit-button');

  // 禁用提交按钮并设置为灰色
  submitButton.disabled = true;
  document.getElementById('user-input').value = '';
  submitButton.style.backgroundColor = 'grey';

  // console.log('User Input:', userInput);  // 输出用户输入

  const response = await fetch('http://localhost:3000/generate-response', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userInput })
  });



  const emotionResponses = await response.json();

  // console.log('Response:', emotionResponses);  // 输出服务器响应

  updateCubeFaces(emotionResponses);
  document.getElementById('Excitement-response').textContent = emotionResponses[0];
  document.getElementById('Happiness-response').textContent = emotionResponses[1];
  document.getElementById('Sadness-response').textContent = emotionResponses[2];
  document.getElementById('Anger-response').textContent = emotionResponses[3];
  document.getElementById('Anxiety-response').textContent = emotionResponses[4];
  document.getElementById('Fear-response').textContent = emotionResponses[5];


  submitButton.disabled = false;
  submitButton.style.backgroundColor = ''; // 恢复原始颜色
  userInput.value = "";
});
