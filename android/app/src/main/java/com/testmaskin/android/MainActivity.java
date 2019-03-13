package com.testmaskin.android;

import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.support.v7.widget.Toolbar;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.TextView;

public class MainActivity extends AppCompatActivity {

    WebView wv;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        Toolbar myToolbar = findViewById(R.id.toolbar);
        setSupportActionBar(myToolbar);

        wv = findViewById(R.id.web_view);
        wv.getSettings().setJavaScriptEnabled(true);
        wv.loadUrl("http://testmaskin:80/");
        wv.setWebViewClient(new WebViewClient());

        String firstName = "Firstname";
        String lastName = "Lastname";

        TextView name = findViewById(R.id.toolbar_title);
        name.setText(firstName + " " + lastName);
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
