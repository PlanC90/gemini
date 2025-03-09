import React from 'react';
import { Bot, MessageCircle } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <div className="flex items-center justify-center mb-8">
              <Bot className="w-12 h-12 text-purple-600 mr-4" />
              <h1 className="text-4xl font-bold text-gray-800">MemeX Gemini</h1>
            </div>
            
            <div className="space-y-6">
              <div className="bg-purple-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <MessageCircle className="w-6 h-6 mr-2 text-purple-600" />
                  How to Use
                </h2>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="font-medium mr-2">1.</span>
                    Add @MemeX_Gemini_Bot to your Telegram group
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2">2.</span>
                    Ask questions by mentioning @MemeX_Gemini_Bot or starting your message with "?"
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2">3.</span>
                    Get AI-powered responses powered by Google's Gemini
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Features</h2>
                <ul className="space-y-2 text-gray-600">
                  <li>• Natural language understanding</li>
                  <li>• Context-aware responses</li>
                  <li>• Group chat integration</li>
                  <li>• Instant AI-powered answers</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
