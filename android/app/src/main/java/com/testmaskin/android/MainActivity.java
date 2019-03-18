package com.testmaskin.android;

import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.support.v7.widget.Toolbar;
import android.util.Log;
import android.webkit.CookieManager;
import android.webkit.CookieSyncManager;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.TextView;

import java.net.CookieHandler;

public class MainActivity extends AppCompatActivity {

    WebView wv;
    String cookies = "No cookie";
    private static final String TAG = "Main_activity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        Toolbar myToolbar = findViewById(R.id.toolbar);
        setSupportActionBar(myToolbar);

        String firstName = "Firstname";
        String lastName = "Lastname";



        CookieManager.getInstance().setAcceptCookie(true);


        wv = findViewById(R.id.web_view);
        wv.getSettings().setJavaScriptEnabled(true);
        wv.loadUrl("http://testmaskin:80/library.html");
        wv.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished (WebView view, String url) {
                Log.d("Cookies", "hope: " + cookies);
            }
        });

        TextView name = findViewById(R.id.toolbar_title);
        name.setText(cookies);
    }

    @Override
    public boolean onKeyDown(int keyCode, android.view.KeyEvent event) {

        if (
                keyCode == android.view.KeyEvent.KEYCODE_BACK  &&
                        wv.canGoBack() ) {

            wv.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
}
